using System;

namespace Kls.SharedServices.ModelClasses {
    public class TokenInfo
    {
        public string AccessToken { get; set; }
        public DateTime ExpiryTime { get; set; }
    }   
}