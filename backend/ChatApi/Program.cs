using ChatApi.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("Default")));

const string CorsPolicy = "Default";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(CorsPolicy, p =>
        p.WithOrigins(
            "http://localhost:5173",     
            "https://*.vercel.app"       
        )
        .SetIsOriginAllowedToAllowWildcardSubdomains()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

var aiBase = Environment.GetEnvironmentVariable("AI_BASE_URL") ?? "http://localhost:7860";
builder.Services.AddHttpClient("AiClient", c => { c.BaseAddress = new Uri(aiBase); });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(CorsPolicy);
app.MapControllers();

app.Run();
