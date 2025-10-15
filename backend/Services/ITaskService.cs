using TaskForU.Api.DTOs;

namespace TaskForU.Api.Services
{
    public interface ITaskService
    {
        Task<PagedTasksDto> GetTasksAsync(int userId, TaskFilterDto filter);
        Task<TaskDto?> GetTaskByIdAsync(Guid taskId, int userId);
        Task<TaskDto> CreateTaskAsync(int userId, CreateTaskDto createTaskDto);
        Task<TaskDto?> UpdateTaskAsync(Guid taskId, int userId, UpdateTaskDto updateTaskDto);
        Task<bool> DeleteTaskAsync(Guid taskId, int userId);
        Task<TaskStatsDto> GetTaskStatsAsync(int userId);
    }
}