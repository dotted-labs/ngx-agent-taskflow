import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Task, TaskData, TaskMessageTypes } from '@dotted-labs/ngx-agent-taskflow';
import { delay, EMPTY, from, mergeMap, Observable, of } from 'rxjs';
import { CustomTaskMessageTypes } from '../models/message-types.enum';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'demo_tasks';
  private readonly http = inject(HttpClient);

  // Get all tasks from localStorage
  getTasks(): Observable<Task<CustomTaskMessageTypes, any>[]> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    // Simulate API delay
    return of(tasks).pipe(delay(500));
  }

  // Create a new task in localStorage
  createTask(task: Task<CustomTaskMessageTypes, any>): Observable<Task<CustomTaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    tasks.push(task);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
    console.log('Task created:', task);
    return of(task).pipe(delay(300));
  }

  // Update a task in localStorage
  updateTask(taskId: string, changes: Partial<Task<CustomTaskMessageTypes, any>>): Observable<Task<CustomTaskMessageTypes, any>> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const index = tasks.findIndex((t: Task<CustomTaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...changes };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log('Task updated:', tasks[index]);
      return of(tasks[index]).pipe(delay(300));
    }

    return of({} as Task<CustomTaskMessageTypes, any>);
  }

  // Delete a task from localStorage
  deleteTask(taskId: string): Observable<boolean> {
    const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    const index = tasks.findIndex((t: Task<CustomTaskMessageTypes, any>) => t.id === taskId);

    if (index !== -1) {
      tasks.splice(index, 1);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
      console.log('Task deleted:', taskId);
      return of(true).pipe(delay(300));
    }

    return of(false);
  }

  chatWithFakeAgent(): Observable<TaskData<CustomTaskMessageTypes, any>> {
    const startTime = Date.now();
    return new Observable<TaskData<CustomTaskMessageTypes, any>>((subscriber) => {
      let progress = 0;

      // Send initial message
      subscriber.next({
        type: TaskMessageTypes.MESSAGE,
        content: 'Starting the process...',
        observation: 'Step 1 of 5',
      });

      // Simulate progress updates
      const interval = setInterval(() => {
        progress += 20;
        subscriber.next({
          type: CustomTaskMessageTypes.PROGRESS,
          content: `Processing: ${progress}% complete`,
          observation: { progress },
        });

        if (progress >= 100) {
          clearInterval(interval);
          subscriber.next({
            type: TaskMessageTypes.DONE,
            content: 'Process completed successfully!',
            observation: { totalTimeMs: Date.now() - startTime },
          });
          subscriber.complete();
        }
      }, 1000);

      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    });
  }

  chatWithAgent(message: string): Observable<TaskData<CustomTaskMessageTypes, any>> {
    return this.http
      .post(
        'http://localhost:3000/agent/chat',
        {
          message: message,
        },
        {
          responseType: 'text', // Handle as text instead of JSON
          observe: 'response', // Get the full response to check headers
        },
      )
      .pipe(
        mergeMap((response: any) => {
          if (response.body) {
            // Parse SSE data manually
            const events = response.body.split('\n\n');
            const jsonDataArray = events
              .filter((event: any) => event.startsWith('data: '))
              .map((event: any) => {
                try {
                  return JSON.parse(event.substring(6));
                } catch (e) {
                  console.log('Error parsing SSE data:', e);
                  return null;
                }
              })
              .filter((data: any) => data !== null);
            return from(jsonDataArray) as Observable<TaskData<CustomTaskMessageTypes, any>>;
          }
          return EMPTY;
        }),
      );
  }
}
