using Microsoft.EntityFrameworkCore;
using TaskForU.Api.Data;
using TaskForU.Api.DTOs;
using TaskForU.Api.Models;

namespace TaskForU.Api.Services
{
    public class TaskService : ITaskService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TaskService> _logger;

        public TaskService(ApplicationDbContext context, ILogger<TaskService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<PagedTasksDto> GetTasksAsync(int userId, TaskFilterDto filter)
        {
            try
            {
                var query = _context.Tasks
                    .Where(t => t.UserId == userId)
                    .AsQueryable();

                // Apply filters
                if (filter.Status.HasValue)
                {
                    query = query.Where(t => t.Status == filter.Status.Value);
                }

                if (!string.IsNullOrWhiteSpace(filter.Search))
                {
                    var searchTerm = filter.Search.ToLower();
                    query = query.Where(t => t.Title.ToLower().Contains(searchTerm) || 
                                           t.Description.ToLower().Contains(searchTerm));
                }

                // Get total count before pagination
                var totalCount = await query.CountAsync();

                // Apply sorting
                query = filter.SortBy.ToLower() switch
                {
                    "title" => filter.SortDescending ? query.OrderByDescending(t => t.Title) : query.OrderBy(t => t.Title),
                    "status" => filter.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
                    _ => filter.SortDescending ? query.OrderByDescending(t => t.CreatedAt) : query.OrderBy(t => t.CreatedAt)
                };

                // Apply pagination
                var tasks = await query
                    .Skip((filter.Page - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .Select(t => new TaskDto
                    {
                        Id = t.Id,
                        Title = t.Title,
                        Description = t.Description,
                        Status = t.Status,
                        CreatedAt = t.CreatedAt,
                        UserId = t.UserId
                    })
                    .ToListAsync();

                return new PagedTasksDto
                {
                    Tasks = tasks,
                    TotalCount = totalCount,
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalPages = (int)Math.Ceiling((double)totalCount / filter.PageSize)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting tasks for user: {UserId}", userId);
                return new PagedTasksDto
                {
                    Tasks = new List<TaskDto>(),
                    TotalCount = 0,
                    Page = filter.Page,
                    PageSize = filter.PageSize,
                    TotalPages = 0
                };
            }
        }

        public async Task<TaskDto?> GetTaskByIdAsync(Guid taskId, int userId)
        {
            try
            {
                var task = await _context.Tasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

                if (task == null)
                    return null;

                return new TaskDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    UserId = task.UserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task {TaskId} for user: {UserId}", taskId, userId);
                return null;
            }
        }

        public async Task<TaskDto> CreateTaskAsync(int userId, CreateTaskDto createTaskDto)
        {
            try
            {
                var task = new Models.Task
                {
                    Id = Guid.NewGuid(),
                    Title = createTaskDto.Title,
                    Description = createTaskDto.Description,
                    Status = createTaskDto.Status ?? Models.TaskStatus.Pending,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                return new TaskDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    UserId = task.UserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating task for user: {UserId}", userId);
                throw;
            }
        }

        public async Task<TaskDto?> UpdateTaskAsync(Guid taskId, int userId, UpdateTaskDto updateTaskDto)
        {
            try
            {
                var task = await _context.Tasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

                if (task == null)
                    return null;

                if (!string.IsNullOrWhiteSpace(updateTaskDto.Title))
                    task.Title = updateTaskDto.Title;

                if (!string.IsNullOrWhiteSpace(updateTaskDto.Description))
                    task.Description = updateTaskDto.Description;

                if (updateTaskDto.Status.HasValue)
                    task.Status = updateTaskDto.Status.Value;

                await _context.SaveChangesAsync();

                return new TaskDto
                {
                    Id = task.Id,
                    Title = task.Title,
                    Description = task.Description,
                    Status = task.Status,
                    CreatedAt = task.CreatedAt,
                    UserId = task.UserId
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating task {TaskId} for user: {UserId}", taskId, userId);
                return null;
            }
        }

        public async Task<bool> DeleteTaskAsync(Guid taskId, int userId)
        {
            try
            {
                var task = await _context.Tasks
                    .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

                if (task == null)
                    return false;

                _context.Tasks.Remove(task);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting task {TaskId} for user: {UserId}", taskId, userId);
                return false;
            }
        }

        public async Task<TaskStatsDto> GetTaskStatsAsync(int userId)
        {
            try
            {
                var tasks = await _context.Tasks
                    .Where(t => t.UserId == userId)
                    .ToListAsync();

                return new TaskStatsDto
                {
                    TotalTasks = tasks.Count,
                    CompletedTasks = tasks.Count(t => t.Status == Models.TaskStatus.Done),
                    PendingTasks = tasks.Count(t => t.Status == Models.TaskStatus.Pending)
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting task stats for user: {UserId}", userId);
                return new TaskStatsDto();
            }
        }
    }
}