namespace Kls.SharedServices.ModelClasses
{
    /// <summary>
    /// Configuration settings required to call the APIM-protected API.
    /// </summary>
    public class APIMConfiguration
    {
        public string TenantId { get; set; }
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Scope { get; set; }
        public string ApimUrl { get; set; }
        public string SubscriptionKey { get; set; }
        public string Audience { get; set; }
    }
}
