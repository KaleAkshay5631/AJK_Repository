Kls.Plugins — Implementation details

This file documents the actual implementation present in Kls.SharedServices.Services.APIMServices.APIMService.

Implemented behavior

- Async token acquisition: GetOAuthTokenAsync retrieves OAuth tokens from Azure AD using client credentials.
- Token caching: tokens are cached in-memory (TokenInfo) and keyed by the concatenation ClientId:Scope:Audience. Tokens are used until expiry minus a buffer (BufferTime).
- HttpClient reuse: APIMService maintains a static ConcurrentDictionary of HttpClient instances keyed by APIM base URL to avoid socket exhaustion on .NET Framework.
- Request execution: CallAPIMRequestAsync performs the HTTP request with per-request headers (subscription key, Authorization Bearer token, optional context headers provided as JSON) and deserializes JSON responses when applicable. A synchronous wrapper CallAPIMRequest forwards to the async method for backward compatibility.
- Configuration: APIMConfiguration contains TenantId, ClientId, ClientSecret, Scope, ApimUrl, SubscriptionKey and Audience and is used to drive token requests and API calls.

Notes

- The code in this branch does not depend on external resilience libraries (Polly) by default. If you need advanced retry, jitter, and circuit-breaker behavior, add Polly and replace the current logic with Policy/PolicyWrap.
- For testability and production flexibility, consider refactoring APIMService to accept an IHttpClientFactory and injected resilience policies.

Testing

- Unit tests added in the test folder demonstrate header propagation and token cache usage by reflecting into APIMService to inject fake HttpClient and cached TokenInfo. Ensure your test project references xUnit (or adapt tests to your preferred framework).

Security

- Do not commit client secrets; use environment variables or a secrets manager (Azure Key Vault recommended).

