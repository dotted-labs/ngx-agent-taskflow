import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { tablerBrain } from '@ng-icons/tabler-icons';
import { MessageComponentAbstraction } from '../../models/message-component-abstraction';
import { TaskMessageTypes } from '../../models/message-types.enum';
import { TaskData } from '../../models/task-data.interface';

@Component({
  selector: 'ngx-message-done-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-done-default.component.html',
  providers: [provideIcons({ tablerBrain })],
})
export class MessageDoneDefaultComponent implements MessageComponentAbstraction<TaskMessageTypes, { totalTimeMs: number }> {
  public item = input.required<TaskData<TaskMessageTypes, any>>();
  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
}
