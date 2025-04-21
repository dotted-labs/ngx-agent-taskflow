import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '@dotted-labs/ngx-agent-taskflow';

@Component({
  selector: 'app-custom-message',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-purple-100 rounded-lg border border-purple-300">
      <h3 class="font-bold text-purple-700">Custom Message Component</h3>
      <div class="mt-2">
        <p class="text-gray-800">{{ item().content }}</p>
        @if (item().observation) {
        <p class="text-sm mt-1 text-gray-600">{{ item().observation }}</p>
        }
      </div>
    </div>
  `,
})
export class CustomMessageComponent {
  item = input.required<TaskData>();
}
