namespace ChatApi.Models;

public class Message
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string UserId { get; set; } = default!;
    public string Text { get; set; } = default!;
    public string SentimentLabel { get; set; } = "unknown";
    public double? SentimentScore { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
