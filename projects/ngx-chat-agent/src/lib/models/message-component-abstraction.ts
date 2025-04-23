import { Signal } from '@angular/core';
import { TaskData } from './task-data.interface';
import { TaskMessageTypes } from './message-types.enum';

export interface MessageComponentAbstraction<TypeEnum extends TaskMessageTypes, T> {
  item: Signal<TaskData<TypeEnum, T>>;
  observation: Signal<T>;
  content: Signal<string>;
  type: Signal<TypeEnum>;
}
