using Kls.SharedServices.Interfaces;
using Kls.SharedServices.ModelClasses;
using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Kls.SharedServices.Services.APIMServices
{
    /// <summary>
    /// Service that handles obtaining tokens from Azure AD and calling APIs
    /// exposed via APIM. This implementation is synchronous; consider
    /// moving to async/await and IHttpClientFactory for production use.
    /// </summary>
    public class APIMService : IAPIMService
    {
        private const int BufferTime = 300;
        // Token endpoint for v2.0 OAuth/token. {0} will be replaced with tenant id.
        private const string tokenEndpoint = "https://login.microsoftonline.com/{0}/oauth2/v2.0/token";

        private readonly object tokenLock = new object();

        // Simple in-memory cache for tokens keyed by client+scope+audience.
        private ConcurrentDictionary<string, TokenInfo> tokenInfoCache = new ConcurrentDictionary<string, TokenInfo>();

        // Basic singleton implementation.
        private static readonly object apimServiceLock = new object();
        private static APIMService apimService;

        public static APIMService Instance
        {
            get
            {
                lock (apimServiceLock)
                {
                    if (apimService == null)
                    {
                        apimService = new APIMService();
                    }
                    return apimService;
                }
            }
        }

        /// <summary>
        /// Validates and deserializes the secure configuration JSON used to call APIM.
        /// Throws InvalidPluginExecutionException when validation fails.
        /// </summary>
        public APIMConfiguration ValidateSecureConfiguration(string secureConfiguration)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(secureConfiguration))
                {
                    throw new InvalidPluginExecutionException("APIM configuration is missing!");
                }

                var apimConfiguration = JsonSerializer.Deserialize<APIMConfiguration>(secureConfiguration);

                var requiredConfig = new Dictionary<string, string>
                {
                    { nameof(apimConfiguration.ClientId), apimConfiguration.ClientId },
                    { nameof(apimConfiguration.Scope), apimConfiguration.Scope },
                    { nameof(apimConfiguration.ClientSecret), apimConfiguration.ClientSecret },
                    { nameof(apimConfiguration.Audience), apimConfiguration.Audience },
                    { nameof(apimConfiguration.SubscriptionKey), apimConfiguration.SubscriptionKey },
                    { nameof(apimConfiguration.TenantId), apimConfiguration.TenantId },
                    { nameof(apimConfiguration.ApimUrl), apimConfiguration.ApimUrl }
                };

                var missingConfig = requiredConfig.Where(x => string.IsNullOrWhiteSpace(x.Value)).Select(x => x.Key).ToList();

                if (missingConfig.Any())
                {
                    string errorFields = string.Join(", ", missingConfig);
                    throw new InvalidPluginExecutionException($"APIM Configuration missing: {errorFields}");
                }

                return apimConfiguration;
            }
            catch
            {
                throw new InvalidPluginExecutionException("Invalid APIM configuration JSON");
            }
        }

        /// <summary>
        /// Requests an OAuth token from Azure AD using client credentials.
        /// Note: synchronous blocking implementation. Consider making this async
        /// and using IHttpClientFactory in long-running applications.
        /// </summary>
        private AuthTokenResponse GetOAuthToken(string clientID, string clientSecret, string scope, string tenantId, string audience, string subscriptionKey)
        {
            using (var client = new HttpClient())
            {
                var parameters = new Dictionary<string, string>
                {
                    { "client_id", clientID },
                    { "client_secret", clientSecret },
                    { "grant_type", "client_credentials" },
                    { "scope", scope },
                    { "audience", audience },
                    { "Ocp-Apim-Subscription-Key", subscriptionKey }
                };

                var content = new FormUrlEncodedContent(parameters);

                var request = new HttpRequestMessage(HttpMethod.Post, string.Format(tokenEndpoint, tenantId))
                {
                    Content = content
                };

                // Blocking call - see TODO below.
                HttpResponseMessage response = client.SendAsync(request).Result;

                if (!response.IsSuccessStatusCode)
                {
                    string errorContent = response.Content.ReadAsStringAsync().Result;
                    throw new Exception($"Token request failed: {response.StatusCode} {errorContent}");
                }

                string jsonResponse = response.Content.ReadAsStringAsync().Result;

                return JsonSerializer.Deserialize<AuthTokenResponse>(jsonResponse);
            }
        }

        /// <summary>
        /// Returns a valid token from cache or requests a new one when expired.
        /// </summary>
        private TokenInfo GetValidToken(APIMConfiguration apimConfiguration, ITracingService tracingService)
        {
            tracingService.Trace("APIM GetValidToken Invoked");

            string cacheKey = $"{apimConfiguration.ClientId}:{apimConfiguration.Scope}:{apimConfiguration.Audience}";

            tracingService.Trace($"CacheKey: {cacheKey}");

            if (!tokenInfoCache.TryGetValue(cacheKey, out TokenInfo tokenInfo) || string.IsNullOrWhiteSpace(tokenInfo?.AccessToken) || DateTime.UtcNow > tokenInfo.ExpiryTime)
            {
                tracingService.Trace("APIM - New Token Requested");

                var authResponse = GetOAuthToken(apimConfiguration.ClientId, apimConfiguration.ClientSecret, apimConfiguration.Scope, apimConfiguration.TenantId, apimConfiguration.Audience, apimConfiguration.SubscriptionKey);

                var newTokenInfo = new TokenInfo
                {
                    AccessToken = authResponse.AccessToken,
                    ExpiryTime = DateTime.UtcNow.AddSeconds(authResponse.ExpiresIn - BufferTime)
                };

                lock (tokenLock)
                {
                    tokenInfoCache[cacheKey] = newTokenInfo;
                }

                tokenInfo = newTokenInfo;
            }
            else
            {
                tracingService.Trace($"Using cached token, expires: {tokenInfo.ExpiryTime}");
            }

            return tokenInfo;
        }

        /// <summary>
        /// Calls the configured APIM endpoint and returns a deserialized response.
        /// </summary>
        public APIMResponse CallAPIMRequest(APIMConfiguration configuration, string endpointUrl, string jsonPayload, string httpMethod, ITracingService tracingService, string contextHeaders)
        {
            try
            {
                TokenInfo tokenInfo = GetValidToken(configuration, tracingService);

                using (var client = new HttpClient())
                {
                    client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", configuration.SubscriptionKey);
                    client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokenInfo.AccessToken);

                    if (!string.IsNullOrWhiteSpace(contextHeaders))
                    {
                        try
                        {
                            var headers = JsonSerializer.Deserialize<Dictionary<string, string>>(contextHeaders);
                            if (headers != null)
                            {
                                foreach (var header in headers)
                                {
                                    if (!string.IsNullOrWhiteSpace(header.Value))
                                    {
                                        client.DefaultRequestHeaders.Add(header.Key, header.Value);
                                        tracingService.Trace($"Header Added: {header.Key} = {header.Value}");
                                    }
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            tracingService.Trace($"Context header parsing failed: {ex.Message}");
                        }
                    }

                    HttpMethod method = new HttpMethod(httpMethod.ToUpperInvariant());
                    string fullApiUrl = configuration.ApimUrl + endpointUrl;
                    var request = new HttpRequestMessage(method, fullApiUrl);

                    if (method == HttpMethod.Post || method == HttpMethod.Put || method.Method == "PATCH")
                    {
                        if (!string.IsNullOrWhiteSpace(jsonPayload))
                        {
                            request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
                        }
                    }

                    // Blocking call - consider making async and using ConfigureAwait(false).
                    HttpResponseMessage response = client.SendAsync(request).Result;

                    string responseContent = response.Content.ReadAsStringAsync().Result;

                    object jsonContent = null;
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        try
                        {
                            jsonContent = JsonSerializer.Deserialize<object>(responseContent);
                        }
                        catch
                        {
                            jsonContent = responseContent;
                        }
                    }

                    return new APIMResponse
                    {
                        StatusCode = (int)response.StatusCode,
                        ResponseContent = jsonContent,
                        IsSuccess = response.IsSuccessStatusCode
                    };
                }
            }
            catch (Exception ex)
            {
                tracingService.Trace($"Exception: {ex.Message}");
                return new APIMResponse
                {
                    StatusCode = 500,
                    ResponseContent = ex.Message,
                    IsSuccess = false
                };
            }
        }
    }
}
