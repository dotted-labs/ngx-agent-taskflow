import { Task } from '../models/task.interface';
import { TaskStatus } from '../models/task-status.enum';

/**
 * Generates a random ID for a task
 */
export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Creates a new task with the given initial data
 */
export function createTask<T extends string, U>(initialData: Partial<Task<T, U>> = {}): Task<T, U> {
  return {
    id: initialData.id || generateTaskId(),
    status: initialData.status || TaskStatus.STARTING,
    data: initialData.data || [],
  };
}
