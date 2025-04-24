import { Injectable } from '@angular/core';
import { SseClient } from 'ngx-sse-client';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  constructor(private sseClient: SseClient) {}

  public chat(message: string, threadId: string) {
    return this.sseClient.stream(
      `http://localhost:3000/agent/chat2?message=${message}&threadId=${threadId}`,
      { keepAlive: true, reconnectionDelay: 100_000, responseType: 'event' },
      { headers: {} },
      'GET',
    );
  }
}
