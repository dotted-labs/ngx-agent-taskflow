import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, InputSignal, NgZone, OnDestroy, OnInit, ViewChild, effect, inject, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerPoint, tablerX } from '@ng-icons/tabler-icons';
import { ComponentMap } from '../../models/component-map.interface';
import { TaskMessageTypes } from '../../models/message-types.enum';
import { Task } from '../../models/task.interface';
import { TaskListStore } from '../../store/task-list.store';
import { TaskItemComponent } from '../task-item/task-item.component';

@Component({
  selector: 'ngx-task-tabs',
  imports: [CommonModule, TaskItemComponent, NgIcon],
  templateUrl: './task-tabs.component.html',
  providers: [provideIcons({ tablerX, tablerPoint })],
  styles: [
    `
      /* Hide scrollbar for Chrome, Safari and Opera */
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }

      /* Hide scrollbar for IE, Edge and Firefox */
      .hide-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }
    `,
  ],
})
export class TaskTabsComponent implements OnInit, OnDestroy {
  public readonly tasks: InputSignal<Task<TaskMessageTypes, any>[]> = input<Task<TaskMessageTypes, any>[]>([]);
  public readonly componentMap: InputSignal<ComponentMap> = input<ComponentMap>({});
  public readonly toolComponentMap: InputSignal<ComponentMap> = input<ComponentMap>({});
  public readonly taskListStore = inject(TaskListStore);
  private readonly ngZone = inject(NgZone);
  private readonly document = inject(DOCUMENT);

  @ViewChild('tabNav') tabNavRef!: ElementRef<HTMLElement>;
  private isDown = false;
  private startX = 0;
  private scrollLeft = 0;
  private previousTasksLength = 0; // Store previous length

  // Define event listeners outside Angular zone for performance
  private mouseMoveListener!: (e: MouseEvent) => void;
  private mouseUpListener!: () => void;

  constructor() {
    // Effect to scroll to new tab
    effect(
      () => {
        const currentTasks = this.tasks();
        const currentLength = currentTasks.length;
        console.log('TaskTabs Effect: Ran', { currentLength, previousLength: this.previousTasksLength });

        // Check if a task was added (length increased)
        if (currentLength > this.previousTasksLength) {
          console.log('TaskTabs Effect: Task added, scheduling scroll.');
          // Ensure DOM is updated before scrolling - Use setTimeout
          setTimeout(() => {
            const navElement = this.tabNavRef?.nativeElement;
            if (navElement) {
              const targetScrollLeft = navElement.scrollWidth;
              console.log('TaskTabs Effect: Scrolling', { currentScrollLeft: navElement.scrollLeft, targetScrollLeft });
              // Scroll to the end
              navElement.scrollLeft = targetScrollLeft;
              console.log('TaskTabs Effect: Scrolled', { newScrollLeft: navElement.scrollLeft });
            } else {
              console.warn('TaskTabs Effect: navElement not found for scrolling.');
            }
          }, 0); // Use setTimeout with 0 delay
        }

        // Update previous length for next change detection
        this.previousTasksLength = currentLength;
      },
      {
        allowSignalWrites: true,
      },
    );
  }

  ngOnInit(): void {
    this.ngZone.runOutsideAngular(() => {
      // Store bound listeners to ensure correct removal
      this.mouseMoveListener = this.onMouseMove.bind(this);
      this.mouseUpListener = this.onMouseUp.bind(this);
    });
  }

  ngOnDestroy(): void {
    // Clean up document listeners if the component is destroyed during a drag
    if (this.isDown) {
      this.document.removeEventListener('mousemove', this.mouseMoveListener);
      this.document.removeEventListener('mouseup', this.mouseUpListener);
    }
  }

  onMouseDown(e: MouseEvent): void {
    const slider = this.tabNavRef.nativeElement;
    this.isDown = true;
    slider.classList.add('cursor-grabbing');
    slider.classList.remove('cursor-grab'); // Ensure grab is removed
    this.startX = e.pageX - slider.offsetLeft;
    this.scrollLeft = slider.scrollLeft;

    // Add listeners to the document outside Angular zone
    this.document.addEventListener('mousemove', this.mouseMoveListener, { passive: false }); // passive: false to allow preventDefault
    this.document.addEventListener('mouseup', this.mouseUpListener);
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDown) return;
    e.preventDefault(); // Prevent text selection/dragging artifacts
    const slider = this.tabNavRef.nativeElement;
    const x = e.pageX - slider.offsetLeft;
    const walk = x - this.startX; // scroll-fast
    slider.scrollLeft = this.scrollLeft - walk;
  }

  private onMouseUp(): void {
    if (!this.isDown) return; // Avoid removing listeners if mouse wasn't down initially

    this.isDown = false;
    const slider = this.tabNavRef.nativeElement;
    slider.classList.remove('cursor-grabbing');
    slider.classList.add('cursor-grab');

    // Remove listeners from the document
    this.document.removeEventListener('mousemove', this.mouseMoveListener);
    this.document.removeEventListener('mouseup', this.mouseUpListener);
  }
}
