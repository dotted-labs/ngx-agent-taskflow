import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerChevronDown, tablerChevronUp } from '@ng-icons/tabler-icons';
import { MessageComponentAbstraction } from '../../models/message-component-abstraction';
import { TaskData } from '../../models/task-data.interface';
import { TaskMessageTypes } from '../../models/message-types.enum';

@Component({
  selector: 'ngx-message-context-default',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './message-context-default.component.html',
  providers: [provideIcons({ tablerChevronDown, tablerChevronUp })],
})
export class MessageContextDefaultComponent implements MessageComponentAbstraction<TaskMessageTypes, any> {
  public item = input.required<TaskData<TaskMessageTypes, any>>();
  public observation = computed(() => this.item().observation);
  public content = computed(() => this.item().content);
  public type = computed(() => this.item().type);
  public isCollapsed = signal(true);

  toggleCollapse() {
    this.isCollapsed.update((value) => !value);
  }
}
