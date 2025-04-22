import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { tablerBrain } from '@ng-icons/tabler-icons';

@Component({
  selector: 'ngx-message-think-default',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './message-think-default.component.html',
  providers: [provideIcons({ tablerBrain })],
  styles: [
    `
      .shine-text {
        position: relative;
        background: linear-gradient(270deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(0, 0, 0, 0.2) 100%);
        background-size: 200% auto;
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: shine 2s linear infinite;
      }

      @keyframes shine {
        to {
          background-position: -200% center;
        }
      }
    `,
  ],
})
export class MessageThinkDefaultComponent {}
