import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { MarkdownModule } from 'ngx-markdown';
import { MessageDirective } from '../../directives/message.directive';
import { TaskMessageTypes } from '../../models/message-types.enum';
@Component({
  selector: 'ngx-message-default',
  imports: [CommonModule, MarkdownModule],
  templateUrl: './message-default.component.html',
})
export class MessageDefaultComponent extends MessageDirective<TaskMessageTypes, any> {
  public message = computed(() => this.item().content.replace(/\\n/g, '\n\n'));
}
