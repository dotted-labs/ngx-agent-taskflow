import { Component, computed, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '../../store/models/task-data.interface';
import { MessageComponentAbstraction } from '../../store/models/message-component-abstraction';
import { TaskMessageTypes } from '../../store/models/message-types.enum';

@Component({
  selector: 'ngx-message-user-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-user-default.component.html',
})
export class MessageUserDefaultComponent implements MessageComponentAbstraction<TaskMessageTypes, any> {
  public item = input.required<TaskData<TaskMessageTypes, any>>();
  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
}
