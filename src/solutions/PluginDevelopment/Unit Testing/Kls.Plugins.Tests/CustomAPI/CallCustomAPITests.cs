using System.Threading.Tasks;
using Xunit;

namespace Kls.Plugins.Tests.CustomAPI
{
    public class CallCustomAPITests
    {
        [Fact]
        public void SampleTest_ShouldPass()
        {
            // Basic sanity test to ensure test project runs
            Assert.True(true);
        }

        [Fact(Skip = "Placeholder: update to call actual plugin API once available")]
        public async Task CallCustomApi_WhenConfigured_ReturnsExpectedResult()
        {
            // TODO: Replace with real arrange/act/assert calling into Kls.Plugins
            await Task.CompletedTask;
            Assert.Fail("This test is a placeholder and should be implemented to call the plugin API.");
        }

        [Fact]
        public void ExecuteDataversePlugin_NullLocalPluginContext_ThrowsWrappedArgumentNullException()
        {
            var plugin = new Kls.Plugins.GeoCustomAPI.CallCustomAPI(string.Empty, string.Empty);

            var method = plugin.GetType().GetMethod("ExecuteDataversePlugin", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            Assert.NotNull(method);

            var tie = Assert.Throws<System.Reflection.TargetInvocationException>(() => method!.Invoke(plugin, new object?[] { null }));

            // Plugin wraps exceptions in Microsoft.Xrm.Sdk.InvalidPluginExecutionException
            Assert.Equal("Microsoft.Xrm.Sdk.InvalidPluginExecutionException", tie.InnerException!.GetType().FullName);
            Assert.Equal(typeof(ArgumentNullException).FullName, tie.InnerException!.InnerException!.GetType().FullName);
        }
    }
}
