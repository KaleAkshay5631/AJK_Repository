using Microsoft.Xrm.Sdk;
using System;
using System.Text.Json;
using Kls.SharedServices.BaseClasses;
using Kls.SharedServices.ModelClasses;
using Kls.SharedServices.Services.APIMServices;

namespace Kls.Geo.Plugins.GeoCustomAPI
{
    /// <summary>
    /// Plugin that reads secure APIM configuration provided to the plugin and
    /// stores a serialized copy in the execution context SharedVariables so
    /// downstream plugin steps can call external APIs with the configuration.
    /// </summary>
    public class GetSecureConfig : PluginBase
    {
        // Holds the validated APIM configuration parsed from the secure config string
        private APIMConfiguration apimConfiguration;

        /// <summary>
        /// Initializes the plugin and validates the secure configuration passed
        /// in the <paramref name="secureConfiguration"/> parameter.
        /// </summary>
        /// <param name="unsecureConfiguration">Unsecure configuration string (not used).</param>
        /// <param name="secureConfiguration">Secure configuration string (expected to contain APIM settings).</param>
        public GetSecureConfig(
            string unsecureConfiguration,
            string secureConfiguration)
            : base(typeof(GetSecureConfig))
        {
            // If secure configuration is supplied, validate and parse it using shared service
            if (!string.IsNullOrWhiteSpace(secureConfiguration))
            {
                apimConfiguration = APIMService.Instance.ValidateSecureConfiguration(secureConfiguration);
            }
        }

        /// <summary>
        /// Executes the plugin logic: validates the execution context, writes the
        /// serialized APIM configuration into SharedVariables and traces progress.
        /// </summary>
        /// <param name="localPluginContext">Local plugin context provided by the runtime.</param>
        protected override void ExecuteDataversePlugin(ILocalPluginContext localPluginContext)
        {
            try
            {
                if (localPluginContext == null)
                {
                    throw new ArgumentNullException(nameof(localPluginContext));
                }

                ITracingService tracingService = localPluginContext.TracingService;

                tracingService.Trace($"Executing {GetType().Name}");

                // Ensure the plugin was invoked with the expected message and context
                IPluginExecutionContext executionContext = GetValidExecutionContextOrThrow(localPluginContext);

                // Trace the subscription key for debugging (null-safe)
                tracingService.Trace($"APIM Subscription Key: {apimConfiguration?.SubscriptionKey}");

                // Serialize the validated configuration and store it in SharedVariables
                executionContext.SharedVariables["apimConfigJson"] = JsonSerializer.Serialize(apimConfiguration);

                tracingService.Trace("Secure config added to SharedVariables");
            }
            catch (Exception ex)
            {
                // Wrap and rethrow plugin exceptions to surface to Dataverse
                throw new InvalidPluginExecutionException(ex.Message, ex);
            }
        }

        /// <summary>
        /// Validates the plugin execution context and ensures the message name
        /// matches the expected trigger for this plugin.
        /// </summary>
        /// <param name="pluginContext">Local plugin context instance.</param>
        /// <returns>The validated plugin execution context.</returns>
        private IPluginExecutionContext GetValidExecutionContextOrThrow(ILocalPluginContext pluginContext)
        {
            if (pluginContext == null)
            {
                throw new ArgumentNullException(nameof(pluginContext));
            }

            const string requiredMessage = "kls_GeoVMSAPICall";

            IPluginExecutionContext executionContext = pluginContext.PluginExecutionContext;

            if (executionContext.MessageName != requiredMessage)
            {
                throw new InvalidPluginExecutionException($"{nameof(GetSecureConfig)} plugin must be triggered by message {requiredMessage}");
            }

            return executionContext;
        }
    }
}
