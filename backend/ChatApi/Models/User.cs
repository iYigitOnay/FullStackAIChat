namespace ChatApi.Models;

public class User
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Nickname { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
