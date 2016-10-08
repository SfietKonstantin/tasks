export class TaskNode {
    identifier: string
    estimatedStartDate: Date
    estimatedDuration: number
    startDate: Date
    duration: number
    parents: Array<TaskNode>
    children: Array<TaskNode>
    modifiers: Array<number>

    constructor(identifier: string) {
        this.identifier = identifier
        this.estimatedStartDate = null
        this.estimatedDuration = null
        this.startDate = null
        this.duration = null
        this.parents = new Array<TaskNode>()
        this.children = new Array<TaskNode>()
        this.modifiers = new Array<number>()
    }

    addChild(child: TaskNode) {
        this.children.push(child)
        child.parents.push(this)
    }
}