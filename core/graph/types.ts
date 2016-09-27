export class TaskNode {
    id: number
    estimatedStartDate: Date
    estimatedDuration: number
    startDate: Date
    duration: number
    parents: Array<TaskNode>
    children: Array<TaskNode>
    impacts: Array<number>

    constructor(id: number) {
        this.id = id
        this.estimatedStartDate = null
        this.estimatedDuration = null
        this.startDate = null
        this.duration = null
        this.parents = new Array<TaskNode>()
        this.children = new Array<TaskNode>()
        this.impacts = new Array<number>()
    }

    addChild(child: TaskNode) {
        this.children.push(child)
        child.parents.push(this)
    }
}