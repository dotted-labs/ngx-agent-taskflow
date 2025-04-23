import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { TaskData } from '../../models/task-data.interface';
import { MessageComponentAbstraction } from '../../models/message-component-abstraction';
import { TaskMessageTypes } from '../../models/message-types.enum';
@Component({
  selector: 'ngx-message-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-default.component.html',
})
export class MessageDefaultComponent implements MessageComponentAbstraction<TaskMessageTypes, any> {
  public item = input.required<TaskData<TaskMessageTypes, any>>();
  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
}
