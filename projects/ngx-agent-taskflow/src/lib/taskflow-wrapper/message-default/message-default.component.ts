import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskData } from '../../store/models/task-data.interface';

@Component({
  selector: 'ngx-message-default',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './message-default.component.html',
})
export class MessageDefaultComponent {
  item = input.required<TaskData>();
}
