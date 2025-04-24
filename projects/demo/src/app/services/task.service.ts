import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TaskData, TaskMessageTypes } from '@dotted-labs/ngx-chat-agent';
import { EMPTY, from, mergeMap, Observable } from 'rxjs';
import { CustomTaskMessageTypes } from '../models/message-types.enum';
import { SseClient } from 'ngx-sse-client';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly sseClient: SseClient = inject(SseClient);

  public chatWithFakeAgent(): Observable<TaskData<CustomTaskMessageTypes, any>> {
    return new Observable<TaskData<CustomTaskMessageTypes, any>>((subscriber) => {
      subscriber.next({
        type: TaskMessageTypes.MESSAGE,
        content: 'Lets create a table with 5 random names and ages',
      });

      setTimeout(() => {
        subscriber.next({
          type: CustomTaskMessageTypes.TOOL_TABLE,
          content: 'Here is the table',
          observation: {
            dataTable: {
              headers: ['Name', 'Age'],
              rows: [
                ['John', '25'],
                ['Jane', '30'],
                ['Jim', '35'],
                ['Jill', '40'],
                ['Jack', '45'],
                ['Jane', '30'],
                ['Jim', '35'],
                ['Jill', '40'],
                ['Jack', '45'],
              ],
            },
          },
        });
      }, 1000);

      setTimeout(() => {
        subscriber.next({
          type: TaskMessageTypes.MESSAGE,
          content: ` Let me know if you need anything else`,
        });
      }, 2000);

      setTimeout(() => {
        subscriber.next({
          type: TaskMessageTypes.DONE,
          content: 'Done',
          observation: {
            totalTimeMs: 2100,
          },
        });
        subscriber.complete(); // Close the observable here
      }, 2100);
    });
  }

  public chatWithAgent(message: string): Observable<TaskData<CustomTaskMessageTypes, any>> {
    return this.http
      .post(
        'http://localhost:3000/agent/chat',
        {
          message: message,
        },
        {
          responseType: 'text', // Handle as text instead of JSON
          observe: 'response', // Get the full response to check headers
        },
      )
      .pipe(
        mergeMap((response: any) => {
          if (response.body) {
            // Parse SSE data manually
            const events = response.body.split('\n\n');
            const jsonDataArray = events
              .filter((event: any) => event.startsWith('data: '))
              .map((event: any) => {
                try {
                  return JSON.parse(event.substring(6));
                } catch (e) {
                  console.log('Error parsing SSE data:', e);
                  return null;
                }
              })
              .filter((data: any) => data !== null);
            return from(jsonDataArray) as Observable<TaskData<CustomTaskMessageTypes, any>>;
          }
          return EMPTY;
        }),
      );
  }
}
