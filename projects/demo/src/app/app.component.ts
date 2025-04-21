import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  NgxAgentTaskflowWrapperComponent,
  TaskListStore,
  Task,
  TaskStatus,
  TaskData,
  ComponentMap,
} from '@dotted-labs/ngx-agent-taskflow';
import { TaskService } from './services/task.service';
import { Observable, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { v4 as uuidv4 } from 'uuid';
import { CustomMessageComponent } from './custom-message/custom-message.component';
import { CustomProgressComponent } from './custom-progress/custom-progress.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgxAgentTaskflowWrapperComponent,
    CommonModule,
    CustomMessageComponent,
    CustomProgressComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'demo';
  isLoading = true;

  // Define component map for different TaskData types
  componentMap: ComponentMap = {
    text: CustomMessageComponent,
    progress: CustomProgressComponent,
  };

  constructor(
    private taskListStore: TaskListStore,
    private taskService: TaskService
  ) {}

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

  // Method to create a new sample task
  createSampleTask() {
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      status: TaskStatus.STARTING,
      data: [
        {
          type: 'text',
          content: 'This is a sample task created from the demo app',
          observation: 'Created manually',
        },
      ],
    };

    this.taskListStore.addTask(newTask);
  }

  // Method to create and connect a task to an observable
  createConnectedTask() {
    const taskId = uuidv4();
    const newTask: Task = {
      id: taskId,
      status: TaskStatus.STARTING,
      data: [
        {
          type: 'text',
          content: 'This task will be connected to a simulated API call',
          observation: 'Initializing...',
        },
      ],
    };

    // First add the task
    this.taskListStore.addTask(newTask);

    // Simulate an API call with multiple updates
    const observable = new Observable<any>((observer) => {
      setTimeout(() => {
        observer.next({ message: 'Step 1 completed', progress: 25 });
      }, 1000);

      setTimeout(() => {
        observer.next({ message: 'Step 2 completed', progress: 50 });
      }, 2000);

      setTimeout(() => {
        observer.next({ message: 'Step 3 completed', progress: 75 });
      }, 3000);

      setTimeout(() => {
        observer.next({ message: 'Process completed', progress: 100 });
        observer.complete();
      }, 4000);
    });

    // Connect the task to the observable
    this.taskListStore.connectTaskObservable(
      taskId,
      observable,
      (data) => {
        // Map data to status
        return data.progress === 100 ? TaskStatus.DONE : TaskStatus.PROCESSING;
      },
      (data) => {
        // Map data to TaskData
        return {
          type: 'progress',
          content: `Progress: ${data.progress}%`,
          observation: data.message,
        };
      }
    );
  }

  clearAllTasks() {
    this.taskListStore.setAllTasks([]);
  }
}
