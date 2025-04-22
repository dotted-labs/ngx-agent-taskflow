import { CommonModule } from '@angular/common';
import { Component, InputSignal, Signal, inject, input } from '@angular/core';
import { ComponentMap } from '../store/models/component-map.interface';
import { TaskListStore } from '../store/task-list.store';
import { getAllTasks } from '../store/utils/task-selectors';
import { MessageDefaultComponent } from './message-default/message-default.component';
import { TaskTabsComponent } from './task-tabs/task-tabs.component';

@Component({
  selector: 'ngx-agent-taskflow-wrapper',
  imports: [CommonModule, TaskTabsComponent],
  templateUrl: './ngx-agent-taskflow-wrapper.component.html',
})
export class NgxAgentTaskflowWrapperComponent {
  // Inject the task list store
  private readonly taskListStore = inject(TaskListStore);

  // Task selectors as computed signals
  public tasks = getAllTasks(this.taskListStore);

  // Component map for task data types
  public componentMap: InputSignal<ComponentMap> = input<ComponentMap>({
    message: MessageDefaultComponent,
  });
}
