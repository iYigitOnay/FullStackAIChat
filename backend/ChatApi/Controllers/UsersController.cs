using ChatApi.Contracts;
using ChatApi.Data;
using ChatApi.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChatApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create(CreateUserDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Nickname))
            return BadRequest("Nickname gerekli");

        var user = new User { Nickname = dto.Nickname.Trim() };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(user);
    }
}
