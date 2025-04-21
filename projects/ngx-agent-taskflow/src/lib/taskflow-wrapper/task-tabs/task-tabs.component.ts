import { CommonModule } from '@angular/common';
import { Component, Input, effect, signal } from '@angular/core';
import { Task } from '../../store/models/task.interface';
import { TaskItemComponent } from '../task-item/task-item.component';
import { ComponentMap } from '../../store/models/component-map.interface';

@Component({
  selector: 'ngx-task-tabs',
  standalone: true,
  imports: [CommonModule, TaskItemComponent],
  templateUrl: './task-tabs.component.html',
})
export class TaskTabsComponent {
  @Input() tasks: Task[] = [];
  @Input() componentMap: ComponentMap = {};

  // Currently selected tab index
  selectedTabIndex = signal(0);

  // Use signal effects instead of ngOnChanges
  constructor() {
    effect(
      () => {
        const tasks = this.tasks;
        if (tasks.length > 0) {
          // If selectedTabIndex is out of bounds or a new task was added, select the newest one
          if (this.selectedTabIndex() >= tasks.length) {
            this.selectedTabIndex.set(tasks.length - 1);
          }
        }
      },
      {
        allowSignalWrites: true,
      }
    );
  }

  // Select a tab by index
  selectTab(index: number): void {
    this.selectedTabIndex.set(index);
  }
}
