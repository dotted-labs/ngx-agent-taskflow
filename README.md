# NgxAgentTaskflow

A modern Angular library for managing and visualizing agent task flows in your application. Easily track tasks, display their progress, and customize how different message types are rendered.

## Installation

```bash
npm install @dotted-labs/ngx-agent-taskflow
```

## Basic Usage

### 1. Import the module in your application

Add the NgxAgentTaskflowWrapperComponent to your imports:

```typescript
import { NgxAgentTaskflowWrapperComponent } from "@dotted-labs/ngx-agent-taskflow";

@Component({
  // ...
  imports: [NgxAgentTaskflowWrapperComponent],
  // ...
})
export class AppComponent {}
```

### 2. Initialize the TaskListStore

Initialize the store with your data source callbacks in your component:

```typescript
import { TaskListStore } from '@dotted-labs/ngx-agent-taskflow';

// In your component constructor
constructor(private taskListStore: TaskListStore) {
  this.taskListStore.init({
    onTaskCreate: (task) => yourApiService.createTask(task),
    onTaskUpdate: (taskId, changes) => yourApiService.updateTask(taskId, changes),
    onTaskDelete: (taskId) => yourApiService.deleteTask(taskId),
    onTasksLoad: () => yourApiService.getTasks()
  });
}
```

### 3. Add the component to your template

```html
<ngx-agent-taskflow-wrapper></ngx-agent-taskflow-wrapper>
```

## Custom Component Mapping

One of the key features of NgxAgentTaskflow is the ability to map different task data types to custom Angular components.

### Step 1: Create custom components

Create components that implement the task item rendering for different types:

```typescript
@Component({
  selector: "app-custom-message",
  standalone: true,
  imports: [CommonModule],
  template: `<div>Your custom template for type "message"</div>`,
})
export class CustomMessageComponent {
  item = input.required<TaskData>();
}
```

### Step 2: Define your component map

Define a map of task types to components:

```typescript
import { ComponentMap } from "@dotted-labs/ngx-agent-taskflow";

// In your component
componentMap: ComponentMap = {
  message: CustomMessageComponent,
  tool_1: Tool1Component,
  tool_2: Tool2Component,
};
```

### Step 3: Pass the map to the wrapper component

```html
<ngx-agent-taskflow-wrapper [componentMap]="componentMap"></ngx-agent-taskflow-wrapper>
```

## Working with Tasks

### Creating a new task

```typescript
import { Task, TaskStatus } from "@dotted-labs/ngx-agent-taskflow";

// Create a new task
const newTask: Task = {
  id: "unique-id",
  status: TaskStatus.STARTING,
  data: [
    {
      type: "message",
      content: "Task message content",
      observation: "Optional observation",
    },
  ],
};

// Add it to the store
this.taskListStore.addTask(newTask);
```

### Connecting a task to an Observable

You can connect a task to an Observable to automatically update the task based on events:

```typescript
this.taskListStore.connectTaskObservable(
  taskId,
  yourObservable$,
  (data) => mapToTaskStatus(data),
  (data) => mapToTaskData(data)
);
```

## Examples

The library includes a demo project showcasing its capabilities.

### Text Message Example

The demo shows how to use a custom component for text messages:

```typescript
// Component map in the demo
componentMap: ComponentMap = {
  text: CustomMessageComponent,
};
```

This renders text messages with a purple background and custom styling.

### Progress Indicator Example

The demo implements a progress component that visualizes task progress:

```typescript
// Connected task example
this.taskListStore.connectTaskObservable(
  taskId,
  progressObservable$,
  // Maps progress data to task status
  (data) => (data.progress === 100 ? TaskStatus.DONE : TaskStatus.PROCESSING),
  // Maps progress data to a TaskData object with type 'progress'
  (data) => ({
    type: "progress",
    content: `Progress: ${data.progress}%`,
    observation: data.message,
  })
);
```

The CustomProgressComponent automatically renders a progress bar based on the percentage in the content.

## Development

To develop the library:

```bash
# Build the library
ng build ngx-agent-taskflow

# Run the demo app
ng serve
```

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss changes.
