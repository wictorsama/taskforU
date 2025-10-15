using Microsoft.EntityFrameworkCore;
using TaskForU.Api.Models;

namespace TaskForU.Api.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Models.Task> Tasks { get; set; } = null!;
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.PasswordHash).IsRequired();
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
            });
            
            // Task configuration
            modelBuilder.Entity<Models.Task>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("NOW()");
                entity.Property(e => e.Status).HasConversion<string>();
                
                // Relationship configuration
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Tasks)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
            
            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed admin user (password: Admin123!)
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Name = "Administrator",
                    Email = "admin@taskforu.com",
                    PasswordHash = "$2a$11$8K1p/a0dqbQupuLjDnkVQeJ6GYnbVkyCLsHxuFK3ZOKTwjbvyof4W", // Admin123!
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true
                }
            );
            
            // Seed sample tasks
            modelBuilder.Entity<Models.Task>().HasData(
                new Models.Task
                {
                    Id = Guid.NewGuid(),
                    Title = "Primeira tarefa",
                    Description = "Esta é a primeira tarefa do sistema",
                    Status = Models.TaskStatus.Pending,
                    UserId = 1,
                    CreatedAt = DateTime.UtcNow
                },
                new Models.Task
                {
                    Id = Guid.NewGuid(),
                    Title = "Segunda tarefa",
                    Description = "Esta é a segunda tarefa do sistema",
                    Status = Models.TaskStatus.Done,
                    UserId = 1,
                    CreatedAt = DateTime.UtcNow
                }
            );
        }
    }
}