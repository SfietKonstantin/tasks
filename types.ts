
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
  duration: number
}

export class TaskNode {
  parent: TaskNode
  children: Array<TaskNode>
  start_date: Date
  duration: number
  task: Task
}