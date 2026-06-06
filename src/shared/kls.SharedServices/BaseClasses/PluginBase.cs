using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Extensions;
using Microsoft.Xrm.Sdk.PluginTelemetry;
using System;
using System.Runtime.CompilerServices;
using System.ServiceModel;

namespace Kls.SharedServices.BaseClasses
{
    /// <summary>
    /// Base class for all plug-ins.
    /// </summary>
    public abstract class PluginBase : IPlugin
    {
        protected string PluginClassName { get; }

        protected PluginBase(Type pluginClassName)
        {
            PluginClassName = pluginClassName.ToString();
        }

        [System.Diagnostics.CodeAnalysis.SuppressMessage(
            "Microsoft.Globalization",
            "CA1303:Do not pass literals as localized parameters",
            Justification = "Execute")]
        public void Execute(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new InvalidPluginExecutionException(nameof(serviceProvider));
            }

            var localPluginContext = new LocalPluginContext(serviceProvider);

            localPluginContext.Trace(
                $"Entered {PluginClassName}.Execute()");

            try
            {
                localPluginContext.Trace(
                    $"Correlation Id: {localPluginContext.PluginExecutionContext.CorrelationId}, " +
                    $"Initiating User: {localPluginContext.PluginExecutionContext.InitiatingUserId}");

                ExecuteDataversePlugin(localPluginContext);
            }
            catch (FaultException<OrganizationServiceFault> ex)
            {
                localPluginContext.Trace($"Exception: {ex}");

                throw new InvalidPluginExecutionException(
                    $"OrganizationServiceFault: {ex.Message}",
                    ex);
            }
            finally
            {
                localPluginContext.Trace(
                    $"Exiting {PluginClassName}.Execute()");
            }
        }

        protected virtual void ExecuteDataversePlugin(
            ILocalPluginContext localPluginContext)
        {
        }
    }

    /// <summary>
    /// Abstraction on top of IServiceProvider.
    /// </summary>
    public interface ILocalPluginContext
    {
        IOrganizationService InitiatingUserService { get; }

        IOrganizationService PluginUserService { get; }

        IPluginExecutionContext PluginExecutionContext { get; }

        IServiceEndpointNotificationService NotificationService { get; }

        ITracingService TracingService { get; }

        IServiceProvider ServiceProvider { get; }

        IOrganizationServiceFactory OrgSvcFactory { get; }

        ILogger Logger { get; }

        void Trace(
            string message,
            [CallerMemberName] string method = null);
    }

    /// <summary>
    /// Local plug-in context.
    /// </summary>
    public class LocalPluginContext : ILocalPluginContext
    {
        public IOrganizationService InitiatingUserService { get; }

        public IOrganizationService PluginUserService { get; }

        public IPluginExecutionContext PluginExecutionContext { get; }

        public IServiceEndpointNotificationService NotificationService { get; }

        public ITracingService TracingService { get; }

        public IServiceProvider ServiceProvider { get; }

        public IOrganizationServiceFactory OrgSvcFactory { get; }

        public ILogger Logger { get; }

        public LocalPluginContext(IServiceProvider serviceProvider)
        {
            if (serviceProvider == null)
            {
                throw new InvalidPluginExecutionException(nameof(serviceProvider));
            }

            ServiceProvider = serviceProvider;

            PluginExecutionContext =
                (IPluginExecutionContext)serviceProvider.GetService(
                    typeof(IPluginExecutionContext));

            TracingService =
                new LocalTracingService(serviceProvider);

            NotificationService =
                (IServiceEndpointNotificationService)serviceProvider.GetService(
                    typeof(IServiceEndpointNotificationService));

            OrgSvcFactory =
                (IOrganizationServiceFactory)serviceProvider.GetService(
                    typeof(IOrganizationServiceFactory));

            Logger =
                (ILogger)serviceProvider.GetService(
                    typeof(ILogger));

            PluginUserService =
                OrgSvcFactory.CreateOrganizationService(
                    PluginExecutionContext.UserId);

            InitiatingUserService =
                OrgSvcFactory.CreateOrganizationService(
                    PluginExecutionContext.InitiatingUserId);
        }

        public void Trace(
            string message,
            [CallerMemberName] string method = null)
        {
            if (string.IsNullOrWhiteSpace(message) ||
                TracingService == null)
            {
                return;
            }

            if (!string.IsNullOrWhiteSpace(method))
            {
                TracingService.Trace($"[{method}] {message}");
            }
            else
            {
                TracingService.Trace(message);
            }
        }
    }

    /// <summary>
    /// Tracing service with timing information.
    /// </summary>
    public class LocalTracingService : ITracingService
    {
        private readonly ITracingService _tracingService;
        private DateTime _previousTraceTime;

        public LocalTracingService(IServiceProvider serviceProvider)
        {
            DateTime utcNow = DateTime.UtcNow;

            var context =
                (IExecutionContext)serviceProvider.GetService(
                    typeof(IExecutionContext));

            DateTime initialTimestamp = context.OperationCreatedOn;

            if (initialTimestamp > utcNow)
            {
                initialTimestamp = utcNow;
            }

            _tracingService =
                (ITracingService)serviceProvider.GetService(
                    typeof(ITracingService));

            _previousTraceTime = initialTimestamp;
        }

        public void Trace(string message, params object[] args)
        {
            var utcNow = DateTime.UtcNow;

            var deltaMilliseconds =
                utcNow.Subtract(_previousTraceTime).TotalMilliseconds;

            try
            {
                if (args == null || args.Length == 0)
                {
                    _tracingService.Trace(
                        $"[+{deltaMilliseconds:N0}ms] {message}");
                }
                else
                {
                    _tracingService.Trace(
                        $"[+{deltaMilliseconds:N0}ms] {string.Format(message, args)}");
                }
            }
            catch (FormatException ex)
            {
                throw new InvalidPluginExecutionException(
                    $"Failed to write trace message due to error {ex.Message}",
                    ex);
            }

            _previousTraceTime = utcNow;
        }
    }
}