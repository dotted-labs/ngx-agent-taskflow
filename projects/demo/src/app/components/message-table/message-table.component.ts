import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageDirective, TaskMessageTypes } from '@dotted-labs/ngx-chat-agent';

@Component({
  selector: 'app-message-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto   p-4 ">
      @if (dataTable()) {
        <div class="border border-base-300 rounded-lg overflow-hidden text-xs">
          <table class="table w-full border-collapse">
            <thead>
              <tr class="bg-base-200">
                @for (header of dataTable()?.headers; track header) {
                  <th class="px-4 py-2 text-left font-medium text-xs">{{ header }}</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of dataTable()?.rows; track row) {
                <tr class="border-t border-base-300 hover:bg-base-100">
                  @for (cell of row; track cell) {
                    <td class="px-4 py-2">{{ cell }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class MessageTableComponent extends MessageDirective<
  TaskMessageTypes,
  {
    dataTable: {
      headers: string[];
      rows: string[][];
    };
  }
> {
  public dataTable = computed(() => this.observation()?.dataTable);
}
