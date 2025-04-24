# ngx-agent-taskflow

This project provides an Angular chat component (`ngx-chat-agent`) designed to interact with AI agents, displaying the flow of tasks and messages.

## What is it for?

![Demo of ngx-chat-agent](public/image.png)

`@dotted-labs/ngx-chat-agent` is an Angular library that simplifies the creation of interactive chat interfaces with AI agents. It allows you to:

- Display conversations with multiple tasks or threads.
- Visualize different types of messages (user, agent thinking, context, final result, tool messages).
- Manage the state of tasks and messages reactively.
- Customize the appearance and behavior of message components.
- Easily integrate with backend services that communicate with language models (LLMs).
- Support real-time streaming responses via Server-Sent Events (SSE).
- Track and display processing time for completed tasks.

## Installation

To install the package in your Angular project, use npm:

```bash
npm install @dotted-labs/ngx-chat-agent
```

Also ensure you have the necessary peer dependencies installed (Angular, RxJS, etc.).

The library uses `ngx-sse-client` for Server-Sent Events integration. It should be installed automatically as a dependency.

## How to use it?

1.  **Import the Component:** Import `ChatAgentComponent` into the module or standalone component where you want to use it.

    ```typescript
    import { ChatAgentComponent } from '@dotted-labs/ngx-chat-agent';

    @Component({
      selector: 'app-my-chat',
      standalone: true,
      imports: [ChatAgentComponent /* ... other imports ... */],
      template: `<ngx-chat-agent [componentMap]="componentMap" [toolComponentMap]="toolComponentMap" />`,
    })
    export class MyChatComponent {
      // ...
    }
    ```

2.  **Initialize the Store:** Inject `TaskListStore` and initialize it. This configures the base behavior and callbacks to interact with your agent logic.

    ```typescript
    import { Component, OnInit, inject } from '@angular/core';
    import { TaskListStore, ComponentMap, TaskMessageTypes } from '@dotted-labs/ngx-chat-agent';
    import { AgentService } from './services/agent.service'; // Your service to talk to the AI
    import { DoneCustomMessageComponent } from './components/done-custom-message/done-custom-message.component';
    import { ToolTableComponent } from './components/tool-table/tool-table.component';

    @Component({
      /* ... */
    })
    export class MyChatComponent implements OnInit {
      private readonly taskListStore = inject(TaskListStore);
      private readonly agentService = inject(AgentService); // Your service

      // Standard message component overrides
      public readonly componentMap: ComponentMap = {
        // Override the DONE message component with your custom implementation
        [TaskMessageTypes.DONE]: DoneCustomMessageComponent,
      };

      // Tool-specific components
      public readonly toolComponentMap: ComponentMap = {
        // Map tool names to components
        ['random_person_generator']: ToolTableComponent,
      };

      ngOnInit() {
        this.taskListStore.init({
          globalContextPrompt: 'Initial context or prompt for the agent.',
          callbacks: {
            onUserMessage: (taskId: string, message: string) => {
              // Connect the user's response to your AI service
              const agentStream = this.agentService.chat(message, taskId);
              this.taskListStore.chatWithAgent(agentStream, taskId, message);
            },
            // Implement other callbacks as needed (onTaskCreate, onTaskUpdate, etc.)
            onTaskCreate: (task) => console.log('Task created:', task),
          },
        });
      }

      // Logic to create tasks
      async createNewTask() {
        const task = await this.taskListStore.createTask('New task name');
        // Optionally, you can start a conversation immediately
        const agentStream = this.agentService.chat('Initial message', task.id);
        this.taskListStore.chatWithAgent(agentStream, task.id, 'Initial message');
      }
    }
    ```

3.  **Agent Service:** You need to create a service that handles communication with your backend using Server-Sent Events. Here's an example:

    ```typescript
    import { Injectable } from '@angular/core';
    import { SseClient } from 'ngx-sse-client';

    @Injectable({
      providedIn: 'root',
    })
    export class AgentService {
      constructor(private sseClient: SseClient) {}

      public chat(message: string, threadId: string) {
        return this.sseClient.stream(
          `http://your-backend-url/agent/chat?message=${message}&threadId=${threadId}`,
          { keepAlive: true, reconnectionDelay: 100_000, responseType: 'event' },
          { headers: {} },
          'GET',
        );
      }
    }
    ```

    The `chatWithAgent` method expects a stream of SSE events with types like 'message', 'tool', 'error', and 'done'.

## Data Structures

The library primarily works with two main data structures defined in `@dotted-labs/ngx-chat-agent`:

1.  **`Task<TypeEnum, ObservationType>`**: Represents a single conversation or task thread.

    - `id: string`: A unique identifier for the task.
    - `name: string`: The display name for the task (e.g., shown in the tab).
    - `status: TaskStatus`: The current state (`STARTING`, `PROCESSING`, `DONE`, `FAILED`).
    - `allowUserInput: boolean`: Controls if the user input field is active for this task.
    - `messages: TaskMessage<TypeEnum, ObservationType>[]`: An array containing all the message turns within the task.

2.  **`TaskMessage<TypeEnum, ObservationType>`**: Represents a single message turn from a specific sender.

    - `sender: TaskMessageSender`: Indicates who sent the message (`USER`, `ASSISTANT`, or `SYSTEM`).
    - `data: TaskData<TypeEnum, ObservationType>[]`: An array containing the actual content pieces of the message turn.

3.  **`TaskData<TypeEnum, ObservationType>`**: This is the core structure that represents a piece of information in the conversation.
    - `type: TypeEnum | TaskMessageTypes`: Specifies the kind of data. It can be a standard type (`TaskMessageTypes.THINK`, `TaskMessageTypes.CONTEXT`, `TaskMessageTypes.MESSAGE`, `TaskMessageTypes.TOOL`, etc.) or a custom type you define.
    - `content: string`: The main content for this data piece. For standard types like `THINK` or `MESSAGE`, this is typically text. For tool messages, it contains the tool name which can be used to match a custom component.
    - `observation?: ObservationType`: Optional structured data associated with this piece, useful for custom components that need more than just string content.

The `chatWithAgent` method processes SSE events and automatically creates the appropriate message structure based on event types.

## SSE Event Types

The `chatWithAgent` method handles the following event types:

- **message**: Text content from the agent, typically showing the thinking or final response.
- **tool**: Tool usage information, with name and content data.
- **error**: Error messages when something goes wrong.
- **done**: Signals the completion of the agent's response and adds a DONE message with processing time.

## Component Customization

The library provides two separate component mapping systems:

1. **Standard Message Components (`componentMap`)**: Used to override the rendering of built-in message types (USER, THINK, MESSAGE, DONE, etc.)

2. **Tool-specific Components (`toolComponentMap`)**: Used to map tool names to specialized components that render tool outputs.

This separation allows for more precise control over how different types of content are displayed.

### Customizing Done Messages

You can create a custom component to display task completion information, including processing time:

```typescript
import { Component, computed } from '@angular/core';
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
```

Then register this component in your `componentMap`:

```typescript
public readonly componentMap: ComponentMap = {
  [TaskMessageTypes.DONE]: DoneCustomMessageComponent,
};
```

### Tool Components

Tool components render data from specific tools used by the agent. For example, a tool that generates random people might render a table:

1.  **Define your tool enum:**

    ```typescript
    export enum CustomTaskMessageTypes {
      RANDOM_PERSON_GENERATOR = 'random_person_generator',
    }
    ```

2.  **Create a component to render the tool's output:**

    ```typescript
    @Component({
      selector: 'app-message-table',
      standalone: true,
      template: `
        <div class="message-tool-table">
          <h4>Generated People</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age</th>
                <th>Occupation</th>
              </tr>
            </thead>
            <tbody>
              @for (person of people(); track person.name) {
                <tr>
                  <td>{{ person.name }}</td>
                  <td>{{ person.age }}</td>
                  <td>{{ person.occupation }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      `,
    })
    export class MessageTableComponent extends MessageDirective<string, { people: { name: string; age: number; occupation: string }[] }> {
      public people = computed(() => this.observation()?.people || []);
    }
    ```

3.  **Register the tool component in your `toolComponentMap`:**

    ```typescript
    public readonly toolComponentMap: ComponentMap = {
      ['random_person_generator']: MessageTableComponent,
    };
    ```

With this setup, when an agent uses the "random_person_generator" tool, its output will be automatically rendered using your custom MessageTableComponent.

## Styling and Customization

The component uses the following libraries for its default styling:

- **Tailwind CSS 4:** For CSS utilities.
- **DaisyUI:** As a Tailwind plugin for predefined UI components.
- **ng-icon / Tabler Icons:** For iconography.

You can fully customize the appearance by overriding Tailwind/DaisyUI styles in your own project or by configuring Tailwind to use your own theme and prefixes if needed, ensuring the chat integrates seamlessly with your application's design.

## Running the Demo

This repository includes a demonstration application within the `projects/demo` directory. This demo serves as a practical example of how to integrate and utilize the `ngx-chat-agent` component.

**Prerequisites:**

- Ensure you have Node.js and npm installed.
- Install project dependencies by running `npm install` in the root directory.

**Launching the Demo:**

To run the demo application, execute the following command from the project's root directory:

```bash
npm run start
```

This command utilizes the Angular CLI (`ng serve`) to build and host the demo application locally. By default, it should be accessible in your web browser at `http://localhost:4200/`.

**What the Demo Shows:**

- **Chat Interface:** You'll see the main `ngx-chat-agent` component rendered, providing a familiar chat UI.
- **Task Management:** The demo allows you to create multiple chat tasks (conversations). Each task appears in a separate tab.
- **Interaction Buttons:**
  - `Create Task`: Starts a new chat task and connects it to an agent service via SSE.
  - `Clear All Tasks`: Removes all current tasks from the interface.
- **Custom Components:**
  - **Done Message:** The demo shows a custom DONE message component that displays the total processing time for each completed task.
  - **Tool Output:** A custom component renders the output of specific tools (like a random person generator) in a formatted way.

Interacting with the demo provides a hands-on understanding of the library's core features, state management via `TaskListStore`, and the customization capabilities using both `componentMap` and `toolComponentMap`.
