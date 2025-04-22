import { CommonModule } from '@angular/common';
import { Component, Input, InputSignal, effect, inject, input, signal } from '@angular/core';
import { Task } from '../../store/models/task.interface';
import { TaskItemComponent } from '../task-item/task-item.component';
import { ComponentMap } from '../../store/models/component-map.interface';
import { TaskMessageTypes } from '../../store/models/message-types.enum';
import { TaskListStore } from '../../store/task-list.store';

@Component({
  selector: 'ngx-task-tabs',
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task-tabs.component.html',
})
export class TaskTabsComponent {
  public readonly tasks: InputSignal<Task<TaskMessageTypes, any>[]> = input<Task<TaskMessageTypes, any>[]>([]);
  public readonly componentMap: InputSignal<ComponentMap> = input<ComponentMap>({});
  public readonly taskListStore = inject(TaskListStore);
}
