namespace ChatApi.Contracts;

public record CreateUserDto(string Nickname);
public record CreateMessageDto(string UserId, string Text);

public record AiRequest(string Text);
public record AiResponse(string Label, double Score);

public record MessageDto(
    string Id,
    string UserId,
    string UserNickname,
    string Text,
    string SentimentLabel,
    double? SentimentScore,
    DateTime CreatedAt
);
