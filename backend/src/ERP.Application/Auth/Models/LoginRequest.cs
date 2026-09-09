using System.ComponentModel.DataAnnotations;

namespace ERP.Application.Auth.Models;

public sealed class LoginRequest
{
    [Required]
    [MinLength(1)]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required]
    [MinLength(1)]
    public string Password { get; set; } = string.Empty;
}
