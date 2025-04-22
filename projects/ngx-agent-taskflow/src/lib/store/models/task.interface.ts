import { TaskData } from './task-data.interface';
import { TaskStatus } from './task-status.enum';

export interface Task<T extends string, U> {
  id: string;
  status: TaskStatus;
  data: TaskData<T, U>[];
}

export interface TaskMessage {
  sender: TaskMessageSender;
  messages: TaskMessage[];
}

export enum TaskMessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
}
