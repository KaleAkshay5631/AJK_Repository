namespace Kls.SharedServices.ModelClasses { 
    public class AuthTokenResponse
    {
        public string AccessToken { get; set; }
        public int ExpiresIn { get; set; }
        public string TokenType { get; set; }
        public int extExpiresIn { get; set; }
    }
}