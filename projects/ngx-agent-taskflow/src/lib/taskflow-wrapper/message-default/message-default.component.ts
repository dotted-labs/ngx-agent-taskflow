import { Component, computed, input, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '../../store/models/task-data.interface';

@Component({
  selector: 'ngx-message-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-default.component.html',
})
export class MessageDefaultComponent implements MessageComponentAbstraction<string, any> {
  public item = input.required<TaskData<string, any>>();

  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
}

export interface MessageComponentAbstraction<TypeEnum extends string, T> {
  item: Signal<TaskData<TypeEnum, T>>;
  observation: Signal<T>;
  content: Signal<string>;
  type: Signal<TypeEnum>;
}
