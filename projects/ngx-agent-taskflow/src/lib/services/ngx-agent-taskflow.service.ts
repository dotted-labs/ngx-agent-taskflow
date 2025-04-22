import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task, TaskMessageTypes } from '@dotted-labs/ngx-agent-taskflow';
import { delay, Observable, of } from 'rxjs';

/**
 * Service for managing tasks in localStorage
 *
 * This service provides methods to create, read, update, and delete tasks
 * in the browser's localStorage. It simulates API behavior by adding
 * artificial delays to the responses.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageTaskService {
  /**
   * Retrieves all tasks from localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @returns An Observable with an array of Task objects
   */
  public getTasks(storageKey: string): Observable<Task<TaskMessageTypes, any>[]> {
    const tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    // Simulate API delay
    return of(tasks).pipe(delay(500));
  }

  /**
   * Creates a new task and saves it to localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param task - The task object to be created
   * @returns An Observable with the created Task object
   */
  public createTask(storageKey: string, task: Task<TaskMessageTypes, any>): Observable<Task<TaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    tasks.push(task);
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    console.log('Task created:', task);
    return of(task).pipe(delay(300));
  }

  /**
   * Updates an existing task in localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param taskId - The ID of the task to update
   * @param changes - Partial task object containing the properties to update
   * @returns An Observable with the updated Task object or an empty object if task not found
   */
  public updateTask(
    storageKey: string,
    taskId: string,
    changes: Partial<Task<TaskMessageTypes, any>>,
  ): Observable<Task<TaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = tasks.findIndex((t: Task<TaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...changes };
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      console.log('Task updated:', tasks[index]);
      return of(tasks[index]).pipe(delay(300));
    }

    return of({} as Task<TaskMessageTypes, any>);
  }

  /**
   * Deletes a task from localStorage
   *
   * @param storageKey - The key used to store tasks in localStorage
   * @param taskId - The ID of the task to delete
   * @returns An Observable with a boolean indicating success (true) or failure (false)
   */
  public deleteTask(storageKey: string, taskId: string): Observable<boolean> {
    const tasks = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = tasks.findIndex((t: Task<TaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(tasks));
      console.log('Task deleted:', taskId);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }
}
