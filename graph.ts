import { Task, Impact } from "./types"

export class TaskNode {
    task: Task
    start_date: Date
    duration: number
    private parents: Array<TaskNode>
    private children: Array<TaskNode>
    private impacts: Array<Impact>

    constructor(task: Task) {
        this.task = task
        this.impacts = new Array<Impact>()
    }

    addChild(child: TaskNode) {
        if (this.children == null) {
            this.children = new Array<TaskNode>() 
        }
        this.children.push(child)

        if (child.parents == null) {
            child.parents = new Array<TaskNode>()
        }
        child.parents.push(this)
    }

    recompute() {
        this.computeDuration()
        this.clearStartTime()
        this.computeStartTime()
    }

    private computeDuration() {
        this.duration = this.task.estimatedDuration
        this.duration += this.impacts.map((value: Impact) => {
            return value.duration
        }).reduce((previous: number, current: number) => {
            return previous + current
        }, 0)
    }

    private clearStartTime() {
        if (this.children == null) {
            return
        }
        for (let child of this.children) {
            child.start_date = null
            child.clearStartTime()
        }
    }

    private computeStartTime() {
        if (this.children == null) {
            return
        }
        if (this.parents == null) {
            this.start_date = this.task.estimatedStartDate
        }
        for (let child of this.children) {
            if (child.start_date == null) {
                let ends = child.parents.map((value: TaskNode) => {
                    let returned = new Date(value.start_date.valueOf())
                    returned.setDate(returned.getDate() + value.duration)
                    return returned
                })
                child.start_date = new Date(Math.max.apply(null, ends))
            }
        }
        for (let child of this.children) {
            child.recompute()
        }
    }
}
