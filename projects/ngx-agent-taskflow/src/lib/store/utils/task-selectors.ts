import { computed } from '@angular/core';
import { TaskListStore } from '../task-list.store';
import { Task } from '../models/task.interface';
import { TaskStatus } from '../models/task-status.enum';
import { TaskMessageTypes } from '../models/message-types.enum';

/**
 * Gets all tasks as an array
 */
export function getAllTasks<T extends TaskMessageTypes, U>(store: TaskListStore) {
  return store.entities;
}

/**
 * Gets a task by ID
 */
export function getTaskById<T extends TaskMessageTypes, U>(store: TaskListStore, taskId: string) {
  return computed(() => {
    const entityMap = store.entityMap();
    return entityMap[taskId] || null;
  });
}

/**
 * Gets the currently selected task
 */
export function getSelectedTask(store: TaskListStore) {
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
export function getTasksByStatus(store: TaskListStore, status: TaskStatus) {
  return computed(() => {
    return store.entities().filter((task) => task.status === status);
  });
}

/**
 * Gets tasks in progress (not completed or failed)
 */
export function getActiveTasks(store: TaskListStore) {
  return computed(() => {
    return store.entities().filter((task) => task.status !== TaskStatus.DONE && task.status !== TaskStatus.FAILED);
  });
}

/**
 * Gets completed tasks
 */
export function getCompletedTasks(store: TaskListStore) {
  return computed(() => {
    return store.entities().filter((task) => task.status === TaskStatus.DONE);
  });
}

/**
 * Gets failed tasks
 */
export function getFailedTasks(store: TaskListStore) {
  return computed(() => {
    return store.entities().filter((task) => task.status === TaskStatus.FAILED);
  });
}
