import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';

import { TaskListStore } from '../store/task-list.store';
import { getAllTasks } from '../store/utils/task-selectors';
import { TaskTabsComponent } from './task-tabs/task-tabs.component';
import { ComponentMap } from '../store/models/component-map.interface';
import { MessageDefaultComponent } from './message-default/message-default.component';

@Component({
  selector: 'ngx-agent-taskflow-wrapper',
  standalone: true,
  imports: [CommonModule, TaskTabsComponent],
  templateUrl: './ngx-agent-taskflow-wrapper.component.html',
})
export class NgxAgentTaskflowWrapperComponent {
  // Inject the task list store
  private taskListStore = inject(TaskListStore);

  // Task selectors as computed signals
  public tasks = getAllTasks(this.taskListStore);

  // Component map for task data types
  @Input() componentMap: ComponentMap = {
    message: MessageDefaultComponent,
  };
}
