namespace Kls.SharedServices.ModelClasses
{
    public class APIMResponse
    {
        public int StatusCode { get; set; }
        public object ResponseContent { get; set; }
        public bool IsSuccess { get; set; }
    }
}