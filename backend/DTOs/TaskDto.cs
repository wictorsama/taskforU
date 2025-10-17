using System.ComponentModel.DataAnnotations;
using TaskForU.Api.Models;

namespace TaskForU.Api.DTOs
{
    public class TaskDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Models.TaskStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public int UserId { get; set; }
    }

    public class CreateTaskDto
    {
        [Required(ErrorMessage = "Title is required")]
        [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string Title { get; set; } = string.Empty;
        
        [StringLength(1000, ErrorMessage = "Description cannot exceed 1000 characters")]
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateTaskDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public Models.TaskStatus? Status { get; set; }
    }

    public class TaskFilterDto
    {
        public Models.TaskStatus? Status { get; set; }
        public string? Search { get; set; }
        public string SortBy { get; set; } = "createdAt";
        public bool SortDescending { get; set; } = false;
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class TaskStatsDto
    {
        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
    }

    public class PagedTasksDto
    {
        public IEnumerable<TaskDto> Tasks { get; set; } = new List<TaskDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}