using Microsoft.Xrm.Sdk;
using Kls.SharedServices.ModelClasses;

namespace Kls.SharedServices.Interfaces
{
    public interface IAPIMService
    {
        /// <summary>
        /// Validate Secure Configuration
        /// </summary>
        /// <param name="secureConfiguration">Secure configuration string</param>
        APIMConfiguration ValidateSecureConfiguration(string secureConfiguration);

        /// <summary>
        /// Call APIM request
        /// </summary>
        /// <param name="configuration">APIM configuration</param>
        /// <param name="endpointUrl">API End Point URL</param>
        /// <param name="jsonPayload">Payload to the API</param>
        /// <param name="httpMethod">HTTP method (GET, POST, etc.)</param>
        /// <param name="tracingService">Tracing service</param>
        /// <param name="contextHeaders">List of context headers</param>
        APIMResponse CallAPIMRequest(
            APIMConfiguration configuration,
            string endpointUrl,
            string jsonPayload,
            string httpMethod,
            ITracingService tracingService,
            string contextHeaders);
    }
}

