using System.Net.Http.Json;
using ChatApi.Contracts;
using ChatApi.Data;
using ChatApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ChatApi.Controllers;

[ApiController]
[Route("api/[controller]")]

public class MessagesController(AppDbContext db, IHttpClientFactory httpClientFactory, ILogger<MessagesController> logger) : ControllerBase
{
[HttpGet]
public async Task<IActionResult> List([FromQuery] int limit = 50)
{
    limit = Math.Clamp(limit, 1, 200);

    try
    {
        // LEFT JOIN: Kullanıcı bulunamazsa da mesaj gelsin
        var q =
            from m in db.Messages
            join u in db.Users on m.UserId equals u.Id into gj
            from u in gj.DefaultIfEmpty()
            orderby m.CreatedAt descending
            select new MessageDto(
                m.Id,
                m.UserId,
                u != null ? u.Nickname : "(silinmiş kullanıcı)",
                m.Text,
                m.SentimentLabel,
                m.SentimentScore,
                m.CreatedAt
            );

        var items = await q.Take(limit).ToListAsync();
        items.Reverse(); // kronolojik artan sıraya çevir
        return Ok(items);
    }
    catch (Exception ex)
    {
        // Her ihtimale karşı hata olursa crude fallback (join’siz)
        logger.LogError(ex, "List messages failed, falling back without join");
        var raw = await db.Messages
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .ToListAsync();

        raw.Reverse();
        var fallback = raw.Select(m => new MessageDto(
            m.Id, m.UserId, "(bilinmiyor)", m.Text,
            m.SentimentLabel, m.SentimentScore, m.CreatedAt
        )).ToList();

        return Ok(fallback);
    }
}



   [HttpPost]
public async Task<IActionResult> Create(CreateMessageDto dto)
{
    if (string.IsNullOrWhiteSpace(dto.UserId) || string.IsNullOrWhiteSpace(dto.Text))
        return BadRequest("UserId ve Text gerekli");

    var user = await db.Users.FindAsync(dto.UserId);
    if (user is null) return BadRequest("Kullanıcı bulunamadı");

    // --- AI çağrısı ---
    string label = "unknown";
    double? score = null;
    try
    {
        var client = httpClientFactory.CreateClient("AiClient");
        var res = await client.PostAsJsonAsync("/predict", new AiRequest(dto.Text));
        if (res.IsSuccessStatusCode)
        {
            var body = await res.Content.ReadFromJsonAsync<AiResponse>();
            if (body is not null)
            {
                var l = (body.Label ?? "").ToLowerInvariant();
                label = l.StartsWith("pos") ? "positive"
                      : l.StartsWith("neg") ? "negative"
                      : l.StartsWith("neu") ? "neutral"
                      : "unknown";
                score = body.Score;
            }
        }
        else
        {
            logger.LogWarning("AI service failed: {Status}", res.StatusCode);
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "AI service error");
    }

    var msg = new Message
    {
        UserId = dto.UserId,
        Text = dto.Text.Trim(),
        SentimentLabel = label,
        SentimentScore = score
    };

    db.Messages.Add(msg);
    await db.SaveChangesAsync();

    var dtoOut = new MessageDto(
        msg.Id, msg.UserId, user.Nickname, msg.Text,
        msg.SentimentLabel, msg.SentimentScore, msg.CreatedAt
    );

    return Ok(dtoOut);
}

}
