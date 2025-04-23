import { TaskMessageTypes } from './message-types.enum';

export interface TaskData<TypeEnum, T> {
  type: TypeEnum | TaskMessageTypes;
  content: string;
  observation?: T;
}
