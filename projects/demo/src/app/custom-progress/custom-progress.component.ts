import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageTypes } from '../models/message-types.enum';
import { MessageDirective } from '../../../../ngx-agent-taskflow/src/lib/taskflow-wrapper/message.directive';

@Component({
  selector: 'app-custom-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h3 class="font-bold text-blue-700">Progress Indicator</h3>
    <div class="mt-2">
      <p class="text-gray-800">{{ content() }}</p>
      <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
        <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" [style.width.%]="progressValue()"></div>
      </div>
    </div>
  `,
})
export class CustomProgressComponent extends MessageDirective<MessageTypes, { progress: number }> {
  public progressValue = computed(() => this.observation()?.progress);
}
