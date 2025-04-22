import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ComponentMap, NgxAgentTaskflowWrapperComponent, TaskListStore, Task } from '@dotted-labs/ngx-agent-taskflow';
import { CustomProgressComponent } from './custom-progress/custom-progress.component';
import { TaskService } from './services/task.service';
import { CustomTaskMessageTypes } from './models/message-types.enum';

@Component({
  selector: 'app-root',
  imports: [NgxAgentTaskflowWrapperComponent, CommonModule],
  template: `
    <div class="flex h-screen flex-col p-4 gap-4 items-center">
      <div class="  w-[500px] overflow-hidden flex justify-center gap-4 p-4">
        <button class="btn btn-sm btn-primary" (click)="createTask(true)">Create Task</button>
        <button class="btn btn-sm btn-primary" (click)="createTask(false)">Create Real Task</button>
        <button class="btn btn-sm btn-error" (click)="clearAllTasks()">Clear All Tasks</button>
      </div>

      <div class="border border-base-300 rounded-2xl h-[500px] w-[500px] overflow-hidden">
        <ngx-agent-taskflow-wrapper [componentMap]="componentMap" />
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly taskListStore = inject(TaskListStore);
  private readonly taskService = inject(TaskService);

  // Define component map for different TaskData types
  public componentMap: ComponentMap = {
    progress: CustomProgressComponent,
  };

  ngOnInit() {
    this.taskListStore.init<CustomTaskMessageTypes>({
      globalContextPrompt: 'You are a helpful assistant that can answer questions and help with tasks.',
      saveInLocalStorage: true,
      saveInLocalStorageKey: 'demo_tasks',
      callbacks: {
        onTaskCreate: (task) => this.taskService.createTask(task),
        onTaskUpdate: (taskId, changes) => this.taskService.updateTask(taskId, changes),
        onTaskDelete: (taskId) => this.taskService.deleteTask(taskId),
        onTasksLoad: () => this.taskService.getTasks(),
        onUserMessage: (taskId: string, message: string) =>
          this.taskListStore.connectTaskObservable(taskId, this.taskService.chatWithAgent(message)),
      },
    });
  }

  public createTask(demo = false) {
    const task = this.taskListStore.createTask<CustomTaskMessageTypes>();

    if (demo) {
      this.taskListStore.connectTaskObservable<CustomTaskMessageTypes, any>(task.id, this.taskService.chatWithFakeAgent());
    } else {
      this.taskListStore.connectTaskObservable<CustomTaskMessageTypes, any>(task.id, this.taskService.chatWithAgent('Hello, how are you?'));
    }
  }

  public clearAllTasks() {
    this.taskService.getTasks().subscribe((tasks) => {
      tasks.forEach((task) => {
        this.taskListStore.removeTask(task.id);
      });
    });
  }
}
