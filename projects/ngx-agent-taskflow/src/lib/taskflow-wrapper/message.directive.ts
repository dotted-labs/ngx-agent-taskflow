import { computed, Directive, model } from '@angular/core';
import { TaskMessageTypes } from '../store/models/message-types.enum';
import { TaskData } from '../store/models/task-data.interface';

@Directive({
  selector: '[ngxMessage]',
  standalone: true,
})
export class MessageDirective<TypeEnum, T> {
  item = model.required<TaskData<TypeEnum, T>>();
  observation = computed(() => this.item().observation);
  content = computed(() => this.item().content);
  type = computed(() => this.item().type);
}
