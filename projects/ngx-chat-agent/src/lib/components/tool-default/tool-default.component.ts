import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerChevronDown, tablerChevronUp, tablerTool } from '@ng-icons/tabler-icons';
import { MarkdownModule } from 'ngx-markdown';
import { MessageDirective } from '../../directives/message.directive';
import { TaskMessageTypes } from '../../models/message-types.enum';

@Component({
  selector: 'ngx-tool-default',
  imports: [CommonModule, NgIcon, MarkdownModule],
  templateUrl: './tool-default.component.html',
  providers: [provideIcons({ tablerChevronDown, tablerChevronUp, tablerTool })],
})
export class ToolDefaultComponent extends MessageDirective<TaskMessageTypes, any> {
  public toolName = computed(() => this.item().content);
  public toolMessage = computed(() => this.item().observation.message);
  public isJson = computed(() => {
    const data = this.item().observation.data;
    return typeof data === 'string' && data.startsWith('```') && data.endsWith('```');
  });
  public isMarkdown = computed(() => {
    const data = this.item().observation.data;
    return typeof data === 'string' && !data.startsWith('```') && !data.endsWith('```');
  });
  public isObject = computed(() => {
    const data = this.item().observation.data;
    return typeof data === 'object' || Array.isArray(data);
  });
  public toolData = computed(() => {
    const data = this.item().observation.data;

    if (this.isJson()) {
      return JSON.parse(data.replace('```', '').trim());
    }

    if (this.isMarkdown()) {
      return data.replace(/\n/g, '\n\n');
    }

    if (this.isObject()) {
      return data;
    }

    // Ensure line breaks are preserved in markdown by converting \n to double line breaks
    // Markdown requires two line breaks for a new paragraph
    return data;
  });
  public isCollapsed = signal(true);

  toggleCollapse() {
    this.isCollapsed.update((value) => !value);
  }
}
