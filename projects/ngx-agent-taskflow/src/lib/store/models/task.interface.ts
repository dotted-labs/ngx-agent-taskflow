import { TaskData } from './task-data.interface';
import { TaskStatus } from './task-status.enum';

export interface Task {
  id: string;
  status: TaskStatus;
  data: TaskData[];
}
