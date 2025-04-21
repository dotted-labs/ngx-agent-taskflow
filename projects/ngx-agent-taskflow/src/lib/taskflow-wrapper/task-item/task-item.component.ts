import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../store/models/task.interface';
import { MessageDefaultComponent } from '../message-default/message-default.component';
import { ComponentMap } from '../../store/models/component-map.interface';

@Component({
  selector: 'ngx-task-item',
  standalone: true,
  imports: [CommonModule, MessageDefaultComponent],
  templateUrl: './task-item.component.html',
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() isActive = false;
  @Input() componentMap: ComponentMap = {};

  getComponentForItem(type: string | undefined): any {
    if (!type || !this.componentMap[type]) {
      return MessageDefaultComponent;
    }
    return this.componentMap[type];
  }
}
