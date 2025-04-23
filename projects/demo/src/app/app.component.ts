import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ChatAgentComponent, ComponentMap, TaskListStore } from '@dotted-labs/ngx-chat-agent';
import { MessageTableComponent } from './components/message-table/message-table.component';
import { CustomTaskMessageTypes } from './models/message-types.enum';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  imports: [ChatAgentComponent, CommonModule],
  template: `
    <div class="flex h-screen flex-col p-4 gap-4 items-center">
      <div class="  w-[500px] overflow-hidden flex justify-center gap-4 p-4">
        <button class="btn btn-sm btn-primary" (click)="createTask(true)">Create Task</button>
        <button class="btn btn-sm btn-error" (click)="taskListStore.removeAllTasks()">Clear All Tasks</button>
      </div>

      <div class="border border-base-300 rounded-2xl h-[500px] w-[500px] overflow-hidden">
        <ngx-chat-agent [componentMap]="componentMap" />
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly taskNumber = signal(0);
  public readonly taskListStore = inject(TaskListStore);
  public readonly componentMap: ComponentMap = {
    [CustomTaskMessageTypes.TOOL_TABLE]: MessageTableComponent,
  };

  public ngOnInit() {
    this.taskListStore.init<CustomTaskMessageTypes>({
      globalContextPrompt: 'You are a helpful assistant that can answer questions and help with tasks.',
      callbacks: {
        onTaskCreate: (task) => console.log('onTaskCreate', task),
        onTaskUpdate: (taskId, changes) => console.log('onTaskUpdate', taskId, changes),
        onTaskDelete: (taskId) => console.log('onTaskDelete', taskId),
        onTasksLoad: () => console.log('onTasksLoad'),
        onUserMessage: (taskId: string, message: string) =>
          this.taskListStore.connectTaskObservable<CustomTaskMessageTypes, any>(taskId, this.taskService.chatWithFakeAgent()),
      },
    });
  }

  public async createTask(demo = false) {
    const task = await this.taskListStore.createTask<CustomTaskMessageTypes>(`Task ${this.taskNumber()}`);

    this.taskNumber.update((prev) => prev + 1);
    this.taskListStore.connectTaskObservable<CustomTaskMessageTypes, any>(task.id, this.taskService.chatWithFakeAgent());
  }
}
