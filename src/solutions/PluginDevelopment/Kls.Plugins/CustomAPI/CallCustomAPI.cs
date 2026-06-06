using Microsoft.Xrm.Sdk;
using System;
using System.Text.Json;
using Kls.SharedServices.BaseClasses;
using Kls.SharedServices.ModelClasses;
using Kls.SharedServices.Services.APIMServices;

namespace Kls.Plugins.GeoCustomAPI
{
    public class CallCustomAPI : PluginBase
    {
        private APIMConfiguration apimConfiguration;

        public CallCustomAPI(
            string unsecureConfiguration,
            string secureConfiguration)
            : base(typeof(CallCustomAPI))
        {
            // currently not used
        }

        protected override void ExecuteDataversePlugin(
            ILocalPluginContext localPluginContext)
        {
            try
            {
                if (localPluginContext == null)
                    throw new ArgumentNullException(nameof(localPluginContext));

                ITracingService tracingService = localPluginContext.TracingService;

                tracingService.Trace($"Executing {GetType().Name}");

                IPluginExecutionContext executionContext =
                    GetValidExecutionContextOrThrow(localPluginContext);

                IOrganizationService organisationService =
                    localPluginContext.InitiatingUserService;

                // Required inputs
                string endpointUrl =
                    GetInputParameterOrThrow<string>(
                        executionContext, "kls_geoendpointurl");

                string httpMethod =
                    GetInputParameterOrThrow<string>(
                        executionContext, "kls_geohttpmethod");

                // Optional inputs
                string parameterObject =
                    executionContext.InputParameters.Contains("kls_geoparameterobject")
                        ? executionContext.InputParameters["kls_geoparameterobject"]?.ToString()
                        : string.Empty;

                string contextHeaders =
                    executionContext.InputParameters.Contains("kls_geocontextheaders")
                        ? executionContext.InputParameters["kls_geocontextheaders"]?.ToString()
                        : string.Empty;

                // Get secure config from shared variables
                if (executionContext.SharedVariables.TryGetValue("apimConfigJson", out var raw)
                    && raw is string configJson)
                {
                    apimConfiguration =
                        JsonSerializer.Deserialize<APIMConfiguration>(configJson);

                    var response = APIMService.Instance.CallAPIMRequest(
                        apimConfiguration,
                        endpointUrl,
                        parameterObject,
                        httpMethod,
                        tracingService,
                        contextHeaders
                    );

                    string serializedResponse =
                        JsonSerializer.Serialize(response);

                    executionContext.OutputParameters["kls_georesponsevalue"] =
                        serializedResponse;
                }
                else
                {
                    executionContext.OutputParameters["kls_georesponsevalue"] =
                        JsonSerializer.Serialize(new APIMResponse
                        {
                            StatusCode = 500,
                            ResponseContent = new { errorMessage = "Configuration not found" },
                            IsSuccess = false
                        });
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message, ex);
            }
        }

        private IPluginExecutionContext GetValidExecutionContextOrThrow(
            ILocalPluginContext pluginContext)
        {
            if (pluginContext == null)
                throw new ArgumentNullException(nameof(pluginContext));

            string requiredMessage = "kls_GeoVMSAPICall";

            IPluginExecutionContext executionContext =
                pluginContext.PluginExecutionContext;

            if (executionContext.MessageName != requiredMessage)
            {
                throw new InvalidPluginExecutionException(
                    $"{nameof(CallCustomAPI)} plugin must be triggered by message {requiredMessage}");
            }

            return executionContext;
        }

        private T GetInputParameterOrThrow<T>(
            IPluginExecutionContext context,
            string key)
        {
            if (context.InputParameters.Contains(key) &&
                context.InputParameters[key] is T value)
            {
                return value;
            }

            throw new ArgumentNullException($"Missing or invalid input parameter: {key}");
        }
    }
}