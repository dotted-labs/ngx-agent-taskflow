export interface TaskData<TypeEnum extends string, T> {
  type: TypeEnum;
  content: string;
  observation?: T;
}
