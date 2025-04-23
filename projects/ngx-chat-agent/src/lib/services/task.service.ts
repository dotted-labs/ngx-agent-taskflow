import { Injectable } from '@angular/core';
import { TaskMessageTypes } from '../models/message-types.enum';
import { Task } from '../models/task.interface';

/**
 * Service for managing tasks in localStorage
 *
 * This service provides methods to create, read, update, and delete tasks
 * in the browser's localStorage.
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly LOCAL_STORAGE_KEY = 'demo_tasks';

  /**
   * Retrieves all tasks from localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @returns A Promise with an array of Task objects
   */
  public async getTasks(): Promise<Task<TaskMessageTypes, any>[]> {
    const tasks = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
    return tasks;
  }

  /**
   * Creates a new task and saves it to localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param task - The task object to be created
   * @returns A Promise with the created Task object
   */
  public async createTask(task: Task<TaskMessageTypes, any>): Promise<Task<TaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(tasks));
    console.log('Task created:', task);
    return task;
  }

  /**
   * Updates an existing task in localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param taskId - The ID of the task to update
   * @param changes - Partial task object containing the properties to update
   * @returns A Promise with the updated Task object or an empty object if task not found
   */
  public async updateTask(taskId: string, changes: Partial<Task<TaskMessageTypes, any>>): Promise<Task<TaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
    const index = tasks.findIndex((t: Task<TaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...changes };
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      console.log('Task updated:', tasks[index]);
      return tasks[index];
    }

    return {} as Task<TaskMessageTypes, any>;
  }

  /**
   * Deletes a task from localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param taskId - The ID of the task to delete
   * @returns A Promise with a boolean indicating success (true) or failure (false)
   */
  public async deleteTask(taskId: string): Promise<boolean> {
    const tasks = JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY) || '[]');
    const index = tasks.findIndex((t: Task<TaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks.splice(index, 1);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(tasks));
      console.log('Task deleted:', taskId);
      return true;
    }

    return false;
  }
}
