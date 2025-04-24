import { CommonModule } from '@angular/common';
import { Component, InputSignal, inject, input } from '@angular/core';
import { ComponentMap } from '../../models/component-map.interface';
import { TaskListStore } from '../../store/task-list.store';
import { getAllTasks } from '../../utils/task-selectors';
import { TaskTabsComponent } from '../task-tabs/task-tabs.component';

@Component({
  selector: 'ngx-chat-agent',
  imports: [CommonModule, TaskTabsComponent],
  templateUrl: './chat-agent.component.html',
})
export class ChatAgentComponent {
  // Inject the task list store
  private readonly taskListStore = inject(TaskListStore);

  // Task selectors as computed signals
  public tasks = getAllTasks(this.taskListStore);

  // Component map for task data types
  public componentMap: InputSignal<ComponentMap> = input<ComponentMap>({});
  public toolComponentMap: InputSignal<ComponentMap> = input<ComponentMap>({});
}
