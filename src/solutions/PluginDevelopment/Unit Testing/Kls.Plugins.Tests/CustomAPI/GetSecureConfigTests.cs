using System;
using System.Reflection;
using System.Threading.Tasks;
using Kls.Geo.Plugins.GeoCustomAPI;
using Xunit;

namespace Kls.Plugins.Tests.CustomAPI
{
    public class GetSecureConfigTests
    {
        [Fact]
        public void Constructor_WithEmptySecureConfig_DoesNotThrow()
        {
            // Passing an empty secure configuration should not call external validators
            var ex = Record.Exception(() => new GetSecureConfig(string.Empty, string.Empty));
            Assert.Null(ex);
        }

        [Fact]
        public void ExecuteDataversePlugin_NullLocalPluginContext_ThrowsArgumentNullException()
        {
            var plugin = new GetSecureConfig(string.Empty, string.Empty);

            // ExecuteDataversePlugin is a protected method; invoke it via reflection with a null argument
            MethodInfo? method = typeof(GetSecureConfig).GetMethod("ExecuteDataversePlugin", BindingFlags.NonPublic | BindingFlags.Instance);
            Assert.NotNull(method);

            var tie = Assert.Throws<TargetInvocationException>(() => method!.Invoke(plugin, new object?[] { null }));

            // The plugin wraps exceptions and rethrows InvalidPluginExecutionException
            Assert.Equal("Microsoft.Xrm.Sdk.InvalidPluginExecutionException", tie.InnerException!.GetType().FullName);
            // Ensure the original cause was ArgumentNullException
            Assert.Equal(typeof(ArgumentNullException).FullName, tie.InnerException.InnerException!.GetType().FullName);
        }
    }
}
