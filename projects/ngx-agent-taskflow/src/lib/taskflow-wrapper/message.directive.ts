import { Directive, input, computed, Input, model } from '@angular/core';
import { TaskData } from '../store/models/task-data.interface';

@Directive({
  selector: '[ngxMessage]',
  standalone: true,
})
export class MessageDirective<TypeEnum extends string, T> {
  item = model.required<TaskData<TypeEnum, T>>();
  observation = computed(() => this.item().observation);
  content = computed(() => this.item().content);
  type = computed(() => this.item().type);
}
