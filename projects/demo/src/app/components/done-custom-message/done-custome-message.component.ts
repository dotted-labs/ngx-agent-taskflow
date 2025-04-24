import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageDirective, TaskMessageTypes } from '@dotted-labs/ngx-chat-agent';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrain } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-done-custom-message',
  standalone: true,
  imports: [CommonModule, NgIcon],
  template: `
    <div class="text-xs text-base-content/30 px-4 flex flex-row gap-1 items-center">
      <ng-icon
        name="tablerBrain"
        class="text-base-content/30 text-xs"
        [title]="'Think time ' + (totalTimeMs() / 1000 | number) + ' seconds'"
      ></ng-icon>
      Think time {{ totalTimeMs() / 1000 | number }} seconds
    </div>
  `,
  providers: [provideIcons({ tablerBrain })],
})
export class DoneCustomMessageComponent extends MessageDirective<TaskMessageTypes, { totalTimeMs: number }> {
  public totalTimeMs = computed(() => this.observation()?.totalTimeMs ?? 0);
}
