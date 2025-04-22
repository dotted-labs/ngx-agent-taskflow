import { Component, computed, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '../../store/models/task-data.interface';
import { MessageComponentAbstraction } from '../../store/models/message-component-abstraction';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrain } from '@ng-icons/tabler-icons';
import { TaskMessageTypes } from '../../store/models/message-types.enum';
@Component({
  selector: 'ngx-message-done-default',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './message-done-default.component.html',
  providers: [provideIcons({ tablerBrain })],
})
export class MessageDoneDefaultComponent implements MessageComponentAbstraction<TaskMessageTypes, { totalTimeMs: number }> {
  public item = input.required<TaskData<TaskMessageTypes, any>>();
  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
}
