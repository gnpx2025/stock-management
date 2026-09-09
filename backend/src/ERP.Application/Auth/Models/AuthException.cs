namespace ERP.Application.Auth.Models;

public enum AuthFailureReason
{
    InvalidCredentials,
    InactiveUser,
    InvalidRefresh,
    RefreshReuse,
    RateLimited
}

public sealed class AuthException : Exception
{
    public AuthFailureReason Reason { get; }

    public AuthException(AuthFailureReason reason, string message)
        : base(message)
    {
        Reason = reason;
    }
}
