import { Injectable, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  EntityId,
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { Observable, Subscription, takeUntil } from 'rxjs';

import { Task } from './models/task.interface';
import { TaskStatus } from './models/task-status.enum';
import { TaskData } from './models/task-data.interface';

// Define callback interfaces for database operations
export interface TaskCallbacks {
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, changes: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTasksLoad?: () => Observable<Task[]>;
}

// Define state interface for additional state properties
interface TaskListStateProps {
  selectedTaskId: string | null;
  isLoading: boolean;
  callbacks: TaskCallbacks;
}

const initialState: TaskListStateProps = {
  selectedTaskId: null,
  isLoading: false,
  callbacks: {},
};

@Injectable({
  providedIn: 'root',
})
export class TaskListStore extends signalStore(
  // Using withEntities for Task management
  withEntities<Task>(),
  // Additional state properties
  withState<TaskListStateProps>(initialState),
  withMethods((store) => {
    // Private variable to store callbacks
    let storeCallbacks: TaskCallbacks = {};

    return {
      /**
       * Initialize the store with callbacks and optionally load existing tasks
       */
      init(callbacks: TaskCallbacks = {}) {
        storeCallbacks = callbacks;
        patchState(store, { callbacks });

        // Load existing tasks if onTasksLoad callback is provided
        if (callbacks.onTasksLoad) {
          this.loadExistingTasks();
        }
      },

      /**
       * Load existing tasks using the provided callback
       */
      loadExistingTasks() {
        if (storeCallbacks.onTasksLoad) {
          patchState(store, { isLoading: true });

          storeCallbacks.onTasksLoad().subscribe({
            next: (tasks: Task[]) => {
              this.setAllTasks(tasks);
              patchState(store, { isLoading: false });
            },
            error: (error: any) => {
              console.error('Error loading tasks:', error);
              patchState(store, { isLoading: false });
            },
          });
        }
      },

      /**
       * Add a new task to the store
       */
      addTask(task: Task) {
        patchState(store, addEntity(task));

        // Call onTaskCreate callback if provided
        if (storeCallbacks.onTaskCreate) {
          storeCallbacks.onTaskCreate(task);
        }
      },

      /**
       * Add multiple tasks to the store
       */
      addTasks(tasks: Task[]) {
        // Add each task individually
        tasks.forEach((task) => {
          patchState(store, addEntity(task));

          // Call onTaskCreate callback if provided
          if (storeCallbacks.onTaskCreate) {
            storeCallbacks.onTaskCreate(task);
          }
        });
      },

      /**
       * Set all tasks in the store (replaces existing tasks)
       */
      setAllTasks(tasks: Task[]) {
        patchState(store, setAllEntities(tasks));
      },

      /**
       * Remove a task from the store
       */
      removeTask(taskId: string) {
        patchState(store, removeEntity(taskId));

        // Call onTaskDelete callback if provided
        if (storeCallbacks.onTaskDelete) {
          storeCallbacks.onTaskDelete(taskId);
        }
      },

      /**
       * Update a task's status
       */
      updateTaskStatus(taskId: string, status: TaskStatus) {
        patchState(
          store,
          updateEntity({
            id: taskId,
            changes: { status },
          })
        );

        // Call onTaskUpdate callback if provided
        if (storeCallbacks.onTaskUpdate) {
          storeCallbacks.onTaskUpdate(taskId, { status });
        }
      },

      /**
       * Add data to a task
       */
      addTaskData(taskId: string, newData: TaskData) {
        // Get the current task - use entityMap to access by ID
        const entityMap = store.entityMap();
        const task = entityMap[taskId];
        if (task) {
          const updatedData = [...task.data, newData];

          // Update the task with the new data
          patchState(
            store,
            updateEntity({
              id: taskId,
              changes: {
                data: updatedData,
              },
            })
          );

          // Call onTaskUpdate callback if provided
          if (storeCallbacks.onTaskUpdate) {
            storeCallbacks.onTaskUpdate(taskId, { data: updatedData });
          }
        }
      },

      /**
       * Select a task by ID
       */
      selectTask(taskId: string | null) {
        patchState(store, { selectedTaskId: taskId });
      },

      /**
       * Connect an observable to update a task
       * @returns Subscription that should be unsubscribed when no longer needed
       */
      connectTaskObservable(
        taskId: string,
        observable: Observable<any>,
        statusMapper: (data: any) => TaskStatus,
        dataMapper: (data: any) => TaskData,
        notifier?: Observable<any>
      ): Subscription {
        // Mark task as processing
        this.updateTaskStatus(taskId, TaskStatus.PROCESSING);

        // Subscribe to the observable
        return observable
          .pipe(notifier ? takeUntil(notifier) : (source) => source)
          .subscribe({
            next: (data) => {
              // Update task status
              const newStatus = statusMapper(data);
              this.updateTaskStatus(taskId, newStatus);

              // Add new data to the task
              const newTaskData = dataMapper(data);
              this.addTaskData(taskId, newTaskData);
            },
            error: (error) => {
              // Mark task as failed
              this.updateTaskStatus(taskId, TaskStatus.FAILED);

              // Add error information to task data
              this.addTaskData(taskId, {
                type: 'error',
                content: error.message || 'Unknown error',
                observation: 'Task failed due to an error',
              });
            },
            complete: () => {
              // Mark task as done when observable completes
              const entityMap = store.entityMap();
              const task = entityMap[taskId];
              if (task && task.status !== TaskStatus.FAILED) {
                this.updateTaskStatus(taskId, TaskStatus.DONE);
              }
            },
          });
      },
    };
  }),
  withHooks({
    onInit: () => {
      // Initialization logic if needed
    },
  })
) {}
