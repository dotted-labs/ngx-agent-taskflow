import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '@dotted-labs/ngx-agent-taskflow';
import { MessageDirective } from '../../../../ngx-agent-taskflow/src/lib/taskflow-wrapper/message.directive';
import { MessageTypes } from '../models/message-types.enum';

@Component({
  selector: 'app-custom-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="font-bold text-purple-700">Custom Message Component</h3>
    <div class="mt-2">
      <p class="text-gray-800">{{ content() }}</p>
      @if (observation()) {
        <p class="text-sm mt-1 text-gray-600">{{ observation() }}</p>
      }
    </div>
  `,
})
export class CustomMessageComponent<T> extends MessageDirective<MessageTypes, T> {}
