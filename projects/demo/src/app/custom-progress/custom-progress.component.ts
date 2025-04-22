import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTaskMessageTypes } from '../models/message-types.enum';
import { MessageDirective } from '../../../../ngx-agent-taskflow/src/lib/taskflow-wrapper/message.directive';

@Component({
  selector: 'app-custom-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2 p-4">
      <h3 class="font-bold text-primary text-xs">
        Custom process message: <span class="text-base-content bg-base-200 px-2 rounded-md">{{ content() }}</span>
      </h3>
      <div class="w-full bg-base-200 rounded-full h-2.5 mt-2">
        <div class="bg-primary h-2.5 rounded-full transition-all duration-300" [style.width.%]="progressValue()"></div>
      </div>
    </div>
  `,
})
export class CustomProgressComponent extends MessageDirective<CustomTaskMessageTypes, { progress: number }> {
  public progressValue = computed(() => this.observation()?.progress);
}
