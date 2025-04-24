import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ChatAgentComponent, ComponentMap, TaskListStore, TaskMessageTypes } from '@dotted-labs/ngx-chat-agent';
import { MessageTableComponent } from './components/message-table/message-table.component';
import { CustomTaskMessageTypes } from './models/message-types.enum';
import { AgentService } from './services/agent.service';
import { MessageDoneDefaultComponent } from '../../../ngx-chat-agent/src/lib/components/message-done-default/message-done-default.component';
import { DoneCustomMessageComponent } from './components/done-custom-message/done-custome-message.component';
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
        <ngx-chat-agent [componentMap]="componentMap" [toolComponentMap]="toolComponentMap" />
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  private readonly agentService = inject(AgentService);
  private readonly taskNumber = signal(0);
  public readonly taskListStore = inject(TaskListStore);
  public readonly componentMap: ComponentMap = {
    [TaskMessageTypes.DONE]: DoneCustomMessageComponent,
  };
  public readonly toolComponentMap: ComponentMap = {
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
          this.taskListStore.chatWithAgent(this.agentService.chat(message, taskId), taskId, message),
      },
    });
  }

  public async createTask(demo = false) {
    const task = await this.taskListStore.createTask<CustomTaskMessageTypes>(`Task ${this.taskNumber()}`);

    this.taskNumber.update((prev) => prev + 1);
    this.taskListStore.chatWithAgent(this.agentService.chat('hi agent!', task.id), task.id, 'hi agent!');
  }
}
