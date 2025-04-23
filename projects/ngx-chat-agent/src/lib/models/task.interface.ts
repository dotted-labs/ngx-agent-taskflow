import { TaskData } from './task-data.interface';
import { TaskStatus } from './task-status.enum';

export interface Task<T, U> {
  id: string;
  name: string;
  status: TaskStatus;
  allowUserInput: boolean;
  messages: TaskMessage<T, U>[];
}

export interface TaskMessage<T, U> {
  sender: TaskMessageSender;
  data: TaskData<T, U>[];
}

export enum TaskMessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}
