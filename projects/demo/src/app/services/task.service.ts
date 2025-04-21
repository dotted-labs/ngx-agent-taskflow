import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Task, TaskStatus, TaskData } from '@dotted-labs/ngx-agent-taskflow';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'demo_tasks';

  constructor() {
    // Initialize localStorage with sample tasks if empty
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      const initialTasks: Task[] = [
        {
          id: '1',
          status: TaskStatus.DONE,
          data: [
            {
              type: 'text',
              content: 'Initial task data',
              observation: 'Created automatically',
            },
          ],
        },
      ];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialTasks));
    }
  }

  // Get all tasks from localStorage
  getTasks(): Observable<Task[]> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    // Simulate API delay
    return of(tasks).pipe(delay(500));
  }

  // Create a new task in localStorage
  createTask(task: Task): Observable<Task> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    console.log('Task created:', task);
    return of(task).pipe(delay(300));
  }

  // Update a task in localStorage
  updateTask(taskId: string, changes: Partial<Task>): Observable<Task> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const taskIndex = tasks.findIndex((t: Task) => t.id === taskId);

    if (taskIndex !== -1) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...changes };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log('Task updated:', tasks[taskIndex]);
      return of(tasks[taskIndex]).pipe(delay(300));
    }

    return of(null as any).pipe(delay(300));
  }

  // Delete a task from localStorage
  deleteTask(taskId: string): Observable<boolean> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const filteredTasks = tasks.filter((t: Task) => t.id !== taskId);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTasks));
    console.log('Task deleted:', taskId);
    return of(true).pipe(delay(300));
  }
}
