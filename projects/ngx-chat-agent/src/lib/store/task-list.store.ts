import { Injectable, inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { addEntity, removeEntity, setAllEntities, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Observable, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { TaskService } from '../services/task.service';
import { TaskMessageTypes } from '../models/message-types.enum';
import { TaskData } from '../models/task-data.interface';
import { TaskStatus } from '../models/task-status.enum';
import { Task, TaskMessage, TaskMessageSender } from '../models/task.interface';

// Define callback interfaces for database operations
export interface TaskCallbacks<T = TaskMessageTypes> {
  onTaskCreate?: (task: Task<T, any>) => void;
  onTaskUpdate?: (taskId: string, changes: Partial<Task<T, any>>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTasksLoad?: (tasks: Task<T, any>[]) => void;
  onUserMessage?: (taskId: string, message: string) => void;
}

// Define state interface for additional state properties
interface TaskListStateProps {
  selectedTaskId: string | null;
  isLoading: boolean;
  callbacks: TaskCallbacks<any>;
  globalContextPrompt: string;
  selectedTabIndex: number;
  saveInLocalStorage: boolean;
  saveInLocalStorageKey: string;
}

const initialState: TaskListStateProps = {
  selectedTaskId: null,
  isLoading: false,
  callbacks: {},
  globalContextPrompt: '',
  selectedTabIndex: 0,
  saveInLocalStorage: true,
  saveInLocalStorageKey: 'demo_tasks',
};

// Factory function to create a Task entity with any message type
type TaskEntity = Task<any, any>;

@Injectable({
  providedIn: 'root',
})
export class TaskListStore extends signalStore(
  withEntities<TaskEntity>(),
  withState<TaskListStateProps>(initialState),
  withMethods((store) => {
    let storeCallbacks: TaskCallbacks<any> = {};
    let taskService = inject(TaskService);

    return {
      /**
       * Initialize the store with callbacks and optionally load existing tasks
       */
      init<T>(
        options: {
          globalContextPrompt: string;
          callbacks: TaskCallbacks<T>;
          taskService?: TaskService | null;
        } = {
          globalContextPrompt: '',
          callbacks: {},
          taskService: null,
        },
      ) {
        storeCallbacks = options.callbacks;
        if (options.taskService) {
          taskService = options.taskService;
        }
        patchState(store, {
          callbacks: options.callbacks,
          globalContextPrompt: options.globalContextPrompt,
        });

        this.loadExistingTasks();
      },

      /**
       * Load existing tasks using the provided callback
       */
      async loadExistingTasks() {
        try {
          patchState(store, { isLoading: true });
          const tasks = await taskService.getTasks();
          this.setAllTasks(tasks);
          patchState(store, { isLoading: false });
          if (storeCallbacks.onTasksLoad) {
            storeCallbacks.onTasksLoad(tasks);
          }
        } catch (error) {
          console.error('Error loading tasks:', error);
          patchState(store, { isLoading: false });
        }
      },

      /**
       * Add a new task to the store
       */
      async createTask<T = TaskMessageTypes>(
        taskName: string,
        contextPrompt: string = '',
        allowUserInput: boolean = true,
        taskId: string = uuidv4(),
      ): Promise<Task<T, any>> {
        const task: Task<T, any> = {
          id: taskId,
          name: taskName,
          status: TaskStatus.STARTING,
          allowUserInput,
          messages: [
            {
              sender: TaskMessageSender.SYSTEM,
              data: [
                {
                  type: TaskMessageTypes.CONTEXT as unknown as T,
                  content: store.globalContextPrompt() + '\n' + contextPrompt,
                },
              ],
            },
          ],
        };

        patchState(store, addEntity(task as unknown as TaskEntity));
        patchState(store, { selectedTabIndex: store.entities().length - 1 });

        // Call onTaskCreate callback if provided
        if (storeCallbacks.onTaskCreate) {
          storeCallbacks.onTaskCreate(task as any);
        }

        if (store.saveInLocalStorage()) {
          await taskService.createTask(task as any);
        }

        return task;
      },

      /**
       * Add multiple tasks to the store
       */
      async addTasks<T>(tasks: Task<T, any>[]) {
        // Add each task individually
        tasks.forEach(async (task) => {
          patchState(store, addEntity(task as unknown as TaskEntity));

          // Call onTaskCreate callback if provided
          if (storeCallbacks.onTaskCreate) {
            storeCallbacks.onTaskCreate(task as any);
          }

          if (store.saveInLocalStorage()) {
            await taskService.createTask(task as any);
          }
        });
      },

      /**
       * Set all tasks in the store (replaces existing tasks)
       */
      setAllTasks<T>(tasks: Task<T, any>[]) {
        patchState(store, setAllEntities(tasks as unknown as TaskEntity[]));
      },

      /**
       * Remove a task from the store
       */
      async removeTask(taskId: string) {
        patchState(store, removeEntity(taskId));

        // Call onTaskDelete callback if provided
        if (storeCallbacks.onTaskDelete) {
          storeCallbacks.onTaskDelete(taskId);
        }

        if (store.saveInLocalStorage()) {
          await taskService.deleteTask(taskId);
        }
      },

      /**
       * Update a task's status
       */
      async updateTaskStatus(taskId: string, status: TaskStatus) {
        patchState(
          store,
          updateEntity({
            id: taskId,
            changes: { status },
          }),
        );

        const entityMap = store.entityMap();
        const task = entityMap[taskId];

        // Call onTaskUpdate callback if provided
        if (storeCallbacks.onTaskUpdate) {
          storeCallbacks.onTaskUpdate(taskId, { ...task });
        }

        if (store.saveInLocalStorage()) {
          await taskService.updateTask(taskId, { ...task });
        }
      },

      /**
       * Process a user message for a task
       */
      async sendMessage(taskId: string, messageContent: string) {
        if (!messageContent.trim()) return;

        // Add user message to the task
        this.addTaskMessage(taskId, TaskMessageSender.USER, {
          type: TaskMessageTypes.USER,
          content: messageContent,
          observation: TaskMessageTypes.USER,
        });

        // Call onUserMessage callback if provided
        if (storeCallbacks.onUserMessage) {
          storeCallbacks.onUserMessage(taskId, messageContent);
        }

        // if (store.saveInLocalStorage()) {
        //   await taskService.updateTask(taskId, messageContent as any);
        // }
      },

      /**
       * Add a message to a task
       */
      async addTaskMessage<T, U>(taskId: string, sender: TaskMessageSender, data: TaskData<T, U>) {
        // Get the current task - use entityMap to access by ID
        const entityMap = store.entityMap();
        const task = entityMap[taskId] as unknown as Task<T, U>;
        if (task) {
          // Check if there is an existing message from the same sender
          const lastMessage = task.messages.length > 0 ? task.messages[task.messages.length - 1] : null;
          let updatedMessages = [...task.messages];

          if (lastMessage && lastMessage.sender === sender) {
            // Add data to the existing message
            const lastIndex = updatedMessages.length - 1;
            updatedMessages[lastIndex] = {
              ...updatedMessages[lastIndex],
              data: [...updatedMessages[lastIndex].data, data],
            };

            // Update the task with the modified messages
            patchState(
              store,
              updateEntity({
                id: taskId,
                changes: {
                  messages: updatedMessages,
                } as Partial<TaskEntity>,
              }),
            );
          } else {
            // Create a new message
            const newMessage: TaskMessage<T, U> = {
              sender,
              data: [data],
            };

            // Add the new message to the task
            updatedMessages = [...task.messages, newMessage];

            patchState(
              store,
              updateEntity({
                id: taskId,
                changes: {
                  messages: updatedMessages,
                } as Partial<TaskEntity>,
              }),
            );
          }

          // // Call onTaskUpdate callback if provided
          // if (storeCallbacks.onTaskUpdate) {
          //   storeCallbacks.onTaskUpdate(taskId, { messages: updatedMessages } as any);
          // }

          // if (store.saveInLocalStorage()) {
          //   await taskService.updateTask(taskId, { messages: updatedMessages } as any);
          // }
        }
      },

      /**
       * Select a task by ID
       */
      selectTask(taskId: string | null) {
        patchState(store, { selectedTaskId: taskId });
      },

      /**
       * Remove all tasks from the store
       */
      removeAllTasks() {
        store.entities().forEach((task) => {
          this.removeTask(task.id);
        });
      },

      getLatestTaskDataMessage(taskId: string): TaskData<any, any> | null {
        const entityMap = store.entityMap();
        const task = entityMap[taskId];
        if (task) {
          return task.messages[task.messages.length - 1].data[task.messages[task.messages.length - 1].data.length - 1];
        }
        return null;
      },

      appendLatestTaskDataMessage(taskId: string, data: string) {
        const entityMap = store.entityMap();
        const task = entityMap[taskId];
        if (task) {
          const lastMessage = task.messages[task.messages.length - 1];
          if (lastMessage) {
            lastMessage.data[lastMessage.data.length - 1] = {
              ...lastMessage.data[lastMessage.data.length - 1],
              content: lastMessage.data[lastMessage.data.length - 1].content + data,
            };
          }
        }
      },

      chatWithAgent<T, U>(agentStream: Observable<any>, taskId: string): Subscription {
        // Mark task as processing
        this.updateTaskStatus(taskId, TaskStatus.PROCESSING);
        const startTime = Date.now();
        const observable = agentStream.subscribe((event: any) => {
          const type = event.type;
          const data = event.data;

          console.info(`SSE request with type "${type}" and data "${data}"`);

          switch (type) {
            case 'error':
              this.updateTaskStatus(taskId, TaskStatus.FAILED);

              // Add error information to task data
              this.addTaskMessage(taskId, TaskMessageSender.ASSISTANT, {
                type: TaskMessageTypes.ERROR as any,
                content: data.message || 'Unknown error',
                observation: 'Task failed due to an error',
              });
              break;
            case 'message':
              const latestTaskDataMessage = this.getLatestTaskDataMessage(taskId);
              if (latestTaskDataMessage?.type !== TaskMessageTypes.MESSAGE) {
                this.addTaskMessage(taskId, TaskMessageSender.ASSISTANT, {
                  type: TaskMessageTypes.MESSAGE,
                  content: data,
                });
              } else {
                this.appendLatestTaskDataMessage(taskId, data);
              }
              break;
            case 'tool':
              const toolName = JSON.parse(data).kwargs.name;
              const toolContent = JSON.parse(data).kwargs.content;
              const toolData = JSON.parse(toolContent);

              this.addTaskMessage(taskId, TaskMessageSender.ASSISTANT, {
                type: TaskMessageTypes.TOOL,
                content: toolName,
                observation: toolData,
              });
              break;
            case 'done':
              const entityMap = store.entityMap();
              const task = entityMap[taskId];
              if (task && task.status !== TaskStatus.FAILED) {
                const totalTimeMs = Date.now() - startTime;
                this.addTaskMessage(taskId, TaskMessageSender.ASSISTANT, {
                  type: TaskMessageTypes.DONE,
                  content: 'Done',
                  observation: { totalTimeMs },
                });
                this.updateTaskStatus(taskId, TaskStatus.DONE);
              }
              observable.unsubscribe();
              break;
            case 'tool_start':
              break;
            default:
              break;
          }
        });

        return observable;
      },

      selectTab(tabIndex: number) {
        patchState(store, { selectedTabIndex: tabIndex });
      },
    };
  }),
) {}
