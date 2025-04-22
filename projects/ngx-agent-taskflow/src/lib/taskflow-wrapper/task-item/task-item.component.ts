import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerArrowUp, tablerChevronRight, tablerLoader, tablerMessageCircle, tablerSend } from '@ng-icons/tabler-icons';
import { ComponentMap } from '../../store/models/component-map.interface';
import { Task, TaskMessageSender } from '../../store/models/task.interface';
import { TaskListStore } from '../../store/task-list.store';
import { MessageContextDefaultComponent } from '../message-context-default/message-context-default.component';
import { MessageDefaultComponent } from '../message-default/message-default.component';
import { MessageDoneDefaultComponent } from '../message-done-default/message-done-default.component';
import { MessageUserDefaultComponent } from '../message-user-default/message-user-default.component';
import { MessageThinkDefaultComponent } from '../message-think-default/message-think-default.component';
import { TaskMessageTypes } from '../../store/models/message-types.enum';
@Component({
  selector: 'ngx-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIcon],
  templateUrl: './task-item.component.html',
  providers: [provideIcons({ tablerLoader, tablerSend, tablerChevronRight, tablerMessageCircle, tablerArrowUp })],
})
export class TaskItemComponent implements AfterViewChecked, OnChanges {
  @Input() task!: Task<TaskMessageTypes, any>;
  @Input() isActive = false;

  public readonly componentMap = input<ComponentMap>();
  public readonly defaultComponentMap = signal<ComponentMap>({
    done: MessageDoneDefaultComponent,
    context: MessageContextDefaultComponent,
    message: MessageDefaultComponent,
    user: MessageUserDefaultComponent,
    think: MessageThinkDefaultComponent,
  });

  public readonly componentMapComputed = computed(() => ({ ...this.defaultComponentMap(), ...this.componentMap() }));
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  private readonly taskListStore = inject(TaskListStore);
  private previousMessageCount = 0;

  currentUserInput = '';

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom()) {
      this.scrollToBottom();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task'] && changes['task'].currentValue) {
      if (this.previousMessageCount < this.task.messages.length) {
        this.previousMessageCount = this.task.messages.length;
        // Use setTimeout to ensure the view has updated before scrolling
        setTimeout(() => this.scrollToBottom(), 0);
      }
    }
  }

  private shouldScrollToBottom(): boolean {
    if (!this.messageContainer) return false;

    // Check if we have new messages
    const newCount = this.task.messages.length;
    const hasNewMessages = newCount !== this.previousMessageCount;
    this.previousMessageCount = newCount;

    return hasNewMessages;
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error scrolling to bottom', err);
    }
  }

  getComponentForItem(sender: TaskMessageSender, type: string | undefined): any {
    if (!type || !this.componentMapComputed()[type]) {
      return MessageDefaultComponent;
    }
    return this.componentMapComputed()[type];
  }

  sendMessage() {
    if (this.currentUserInput.trim() && this.task.status !== 'processing') {
      this.taskListStore.sendMessage(this.task.id, this.currentUserInput);
      this.currentUserInput = '';
      // Scroll to bottom after sending a message
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }
}
