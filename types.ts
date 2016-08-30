
export class Project {
  id: number
  name: string
  description: string
}

export class Task {
  id: number
  project_id: number
  name: string
  description: string
}

export class Impact {
  id: number
  task_id: number
  name: string
  description: string
}

export class TaskNode {
  parent: TaskNode
  children: Array<TaskNode>
  task: Task
}