using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using TaskForU.Api.Data;
using TaskForU.Api.DTOs;
using TaskForU.Api.Models;
using TaskForU.Api.Services;
using Xunit;

namespace TaskForU.Api.Tests
{
    public class TaskServiceTests : IDisposable
    {
        private readonly ApplicationDbContext _context;
        private readonly Mock<ILogger<TaskService>> _mockLogger;
        private readonly TaskService _taskService;

        public TaskServiceTests()
        {
            // Setup in-memory database
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _mockLogger = new Mock<ILogger<TaskService>>();
            _taskService = new TaskService(_context, _mockLogger.Object);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var user = new User
            {
                Id = 1,
                Name = "Test User",
                Email = "test@example.com",
                PasswordHash = "hashedpassword",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            var task1 = new Models.Task
            {
                Id = Guid.NewGuid(),
                Title = "Test Task 1",
                Description = "Description for test task 1",
                Status = Models.TaskStatus.Pending,
                UserId = 1,
                CreatedAt = DateTime.UtcNow
            };

            var task2 = new Models.Task
            {
                Id = Guid.NewGuid(),
                Title = "Test Task 2",
                Description = "Description for test task 2",
                Status = Models.TaskStatus.Done,
                UserId = 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _context.Tasks.AddRange(task1, task2);
            _context.SaveChanges();
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTasksAsync_ShouldReturnUserTasks()
        {
            // Arrange
            int userId = 1;
            var filter = new TaskFilterDto();

            // Act
            var result = await _taskService.GetTasksAsync(userId, filter);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Tasks.Count());
            Assert.All(result.Tasks, task => Assert.Equal(userId, task.UserId));
        }

        [Fact]
        public async System.Threading.Tasks.Task CreateTaskAsync_ShouldCreateNewTask()
        {
            // Arrange
            var createTaskDto = new CreateTaskDto
            {
                Title = "New Test Task",
                Description = "New test task description"
            };
            int userId = 1;

            // Act
            var result = await _taskService.CreateTaskAsync(userId, createTaskDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createTaskDto.Title, result.Title);
            Assert.Equal(createTaskDto.Description, result.Description);
            Assert.Equal(Models.TaskStatus.Pending, result.Status);
            Assert.Equal(userId, result.UserId);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskByIdAsync_WithValidId_ShouldReturnTask()
        {
            // Arrange
            var existingTask = await _context.Tasks.FirstAsync();
            int userId = 1;

            // Act
            var result = await _taskService.GetTaskByIdAsync(existingTask.Id, userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(existingTask.Id, result.Id);
            Assert.Equal(existingTask.Title, result.Title);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskByIdAsync_WithInvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidId = Guid.NewGuid();
            int userId = 1;

            // Act
            var result = await _taskService.GetTaskByIdAsync(invalidId, userId);

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async System.Threading.Tasks.Task UpdateTaskAsync_WithValidData_ShouldUpdateTask()
        {
            // Arrange
            var existingTask = await _context.Tasks.FirstAsync();
            var updateTaskDto = new UpdateTaskDto
            {
                Title = "Updated Task Title",
                Description = "Updated description",
                Status = Models.TaskStatus.Done
            };
            int userId = 1;

            // Act
            var result = await _taskService.UpdateTaskAsync(existingTask.Id, userId, updateTaskDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(updateTaskDto.Title, result.Title);
            Assert.Equal(updateTaskDto.Description, result.Description);
            Assert.Equal(updateTaskDto.Status, result.Status);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteTaskAsync_WithValidId_ShouldReturnTrue()
        {
            // Arrange
            var existingTask = await _context.Tasks.FirstAsync();
            int userId = 1;

            // Act
            var result = await _taskService.DeleteTaskAsync(existingTask.Id, userId);

            // Assert
            Assert.True(result);

            // Verify task is deleted
            var deletedTask = await _context.Tasks.FindAsync(existingTask.Id);
            Assert.Null(deletedTask);
        }

        [Fact]
        public async System.Threading.Tasks.Task DeleteTaskAsync_WithInvalidId_ShouldReturnFalse()
        {
            // Arrange
            var invalidId = Guid.NewGuid();
            int userId = 1;

            // Act
            var result = await _taskService.DeleteTaskAsync(invalidId, userId);

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async System.Threading.Tasks.Task GetTaskStatsAsync_ShouldReturnCorrectStatistics()
        {
            // Arrange
            int userId = 1;

            // Act
            var result = await _taskService.GetTaskStatsAsync(userId);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.TotalTasks);
            Assert.Equal(1, result.CompletedTasks);
            Assert.Equal(1, result.PendingTasks);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}