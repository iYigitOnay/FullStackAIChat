using ChatApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApi.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Message> Messages => Set<Message>();
}
