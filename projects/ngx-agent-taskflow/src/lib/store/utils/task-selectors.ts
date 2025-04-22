import { computed } from '@angular/core';
import { TaskListStore } from '../task-list.store';
import { Task } from '../models/task.interface';
import { TaskStatus } from '../models/task-status.enum';

/**
 * Gets all tasks as an array
 */
export function getAllTasks<T extends string, U>(store: TaskListStore<T, U>) {
  return store.entities;
}

/**
 * Gets a task by ID
 */
export function getTaskById<T extends string, U>(store: TaskListStore<T, U>, taskId: string) {
  return computed(() => {
    const entityMap = store.entityMap();
    return entityMap[taskId] || null;
  });
}

/**
 * Gets the currently selected task
 */
export function getSelectedTask<T extends string, U>(store: TaskListStore<T, U>) {
  return computed(() => {
    const selectedId = store.selectedTaskId();
    if (!selectedId) return null;

    const entityMap = store.entityMap();
    return entityMap[selectedId] || null;
  });
}

/**
 * Gets all tasks with a specific status
 */
export function getTasksByStatus<T extends string, U>(store: TaskListStore<T, U>, status: TaskStatus) {
  return computed(() => {
    return store.entities().filter((task) => task.status === status);
  });
}

/**
 * Gets tasks in progress (not completed or failed)
 */
export function getActiveTasks<T extends string, U>(store: TaskListStore<T, U>) {
  return computed(() => {
    return store.entities().filter((task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.FAILED);
  });
}

/**
 * Gets completed tasks
 */
export function getCompletedTasks<T extends string, U>(store: TaskListStore<T, U>) {
  return computed(() => {
    return store.entities().filter((task) => task.status === TaskStatus.DONE);
  });
}

/**
 * Gets failed tasks
 */
export function getFailedTasks<T extends string, U>(store: TaskListStore<T, U>) {
  return computed(() => {
    return store.entities().filter((task) => task.status === TaskStatus.FAILED);
  });
}
