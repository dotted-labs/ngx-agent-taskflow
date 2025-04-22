import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxAgentTaskflowWrapperComponent, TaskListStore, Task, TaskStatus, TaskData, ComponentMap } from '@dotted-labs/ngx-agent-taskflow';
import { TaskService } from './services/task.service';
import { Observable, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { CustomMessageComponent } from './custom-message/custom-message.component';
import { CustomProgressComponent } from './custom-progress/custom-progress.component';
import { HttpClient } from '@angular/common/http';
import { MessageTypes } from './models/message-types.enum';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgxAgentTaskflowWrapperComponent, CommonModule],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'demo';
  isLoading = true;

  // Define component map for different TaskData types
  componentMap: ComponentMap = {
    message: CustomMessageComponent,
    progress: CustomProgressComponent,
  };

  private readonly http = inject(HttpClient);
  private readonly taskListStore = inject(TaskListStore);
  private readonly taskService = inject(TaskService);

  ngOnInit() {
    // Initialize the TaskListStore with callbacks to our TaskService
    this.taskListStore.init({
      onTaskCreate: (task) => {
        console.log('Task created callback:', task);
        return this.taskService.createTask(task);
      },
      onTaskUpdate: (taskId, changes) => {
        console.log('Task updated callback:', taskId, changes);
        return this.taskService.updateTask(taskId, changes);
      },
      onTaskDelete: (taskId) => {
        console.log('Task deleted callback:', taskId);
        return this.taskService.deleteTask(taskId);
      },
      onTasksLoad: () => {
        console.log('Loading tasks from service...');
        return this.taskService.getTasks();
      },
    });

    // Add a demo button to create a new task
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  // Method to create and connect a task to an observable
  createConnectedTask() {
    const taskId = uuidv4();
    const newTask: Task<MessageTypes, any> = {
      id: taskId,
      status: TaskStatus.STARTING,
      data: [
        {
          type: MessageTypes.MESSAGE,
          content: 'This task will be connected to a simulated API call',
          observation: 'Initializing...',
        },
        {
          type: MessageTypes.CUSTOM,
          content: 'Progress',
          observation: { progress: 0 },
        },
      ],
    };

    // First add the task
    this.taskListStore.addTask(newTask);

    // Setup SSE connection instead of regular HTTP request
    this.http
      .post(
        'http://localhost:3000/agent/chat',
        {
          message: 'Hello, how are you?,dame 10 tenders',
        },
        {
          responseType: 'text', // Handle as text instead of JSON
          observe: 'response', // Get the full response to check headers
        },
      )
      .subscribe({
        next: (response) => {
          if (response.body) {
            // Parse SSE data manually
            const events = response.body.split('\n\n');
            events.forEach((event) => {
              if (event.startsWith('data: ')) {
                try {
                  const jsonData = JSON.parse(event.substring(6));
                  console.log('SSE data:', jsonData);
                  // Process the SSE data as needed
                } catch (e) {
                  console.log('Error parsing SSE data:', e);
                }
              }
            });
          }
        },
        error: (err) => console.error('Error with SSE request:', err),
      });

    // Simulate an API call with multiple updates
    const observable = new Observable<any>((observer) => {
      setTimeout(() => {
        observer.next({
          type: 'progress',
          content: 'Step 1 completed',
          observation: { progress: 25 },
        });
      }, 1000);

      setTimeout(() => {
        observer.next({
          type: 'progress',
          content: 'Step 2 completed',
          observation: { progress: 50 },
        });
      }, 2000);

      setTimeout(() => {
        observer.next({
          type: 'progress',
          content: 'Step 3 completed',
          observation: { progress: 75 },
        });
      }, 3000);

      setTimeout(() => {
        observer.next({
          type: 'progress',
          content: 'Process completed',
          observation: { progress: 100 },
        });
        observer.complete();
      }, 4000);
    });

    // Connect the task to the observable
    this.taskListStore.connectTaskObservable(taskId, observable);
  }

  clearAllTasks() {
    this.taskListStore.entities().forEach((task) => {
      this.taskListStore.removeTask(task.id);
    });
  }
}
