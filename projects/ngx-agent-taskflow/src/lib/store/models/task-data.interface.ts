export interface TaskData {
  content?: string;
  observation?: string;
  type?: 'message' | 'tool_1' | 'tool_2' | string;
}
