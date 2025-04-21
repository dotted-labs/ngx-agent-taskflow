import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '@dotted-labs/ngx-agent-taskflow';

@Component({
  selector: 'app-custom-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 class="font-bold text-blue-700">Progress Indicator</h3>
      <div class="mt-2">
        <p class="text-gray-800">{{ item().content }}</p>

        @if (item().content) { @if (getProgressValue() > 0) {
        <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            [style.width.%]="getProgressValue()"
          ></div>
        </div>
        } } @if (item().observation) {
        <p class="text-sm mt-2 text-gray-600">{{ item().observation }}</p>
        }
      </div>
    </div>
  `,
})
export class CustomProgressComponent {
  item = input.required<TaskData>();

  getProgressValue(): number {
    const content = this.item().content;
    if (!content) return 0;

    // Extract progress percentage from content string like "Progress: 75%"
    const match = content.match(/Progress: (\d+)%/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return 0;
  }
}
