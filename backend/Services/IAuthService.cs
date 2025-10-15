using TaskForU.Api.DTOs;

namespace TaskForU.Api.Services
{
    public interface IAuthService
    {
        Task<LoginResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserDto?> RegisterAsync(CreateUserDto createUserDto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<UserDto?> GetUserByIdAsync(int userId);
        Task<UserDto?> GetUserByEmailAsync(string email);
        string GenerateJwtToken(UserDto user);
        bool VerifyPassword(string password, string hash);
        string HashPassword(string password);
    }
}