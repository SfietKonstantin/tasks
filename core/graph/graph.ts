import { Task, Impact } from "../types"
import { IDataProvider } from "../data/idataprovider"

export class TaskNode {
    taskId: number
    estimatedStartDate: Date
    estimatedDuration: number
    startDate: Date
    duration: number
    private parents: Array<TaskNode>
    private children: Array<TaskNode>
    private impacts: Array<number>

    constructor() {
        this.parents = new Array<TaskNode>()
        this.children = new Array<TaskNode>()
        this.impacts = new Array<number>()
    }

    addChild(child: TaskNode) {
        this.children.push(child)
        child.parents.push(this)
    }

    recompute() {
        this.computeDuration()
        this.clearStartTime()
        this.computeStartTime()
    }

    private computeDuration() {
        this.duration = this.estimatedDuration
        this.duration += this.impacts.reduce((previous: number, current: number) => {
            return previous + current
        }, 0)
    }

    private clearStartTime() {
        if (this.children == null) {
            return
        }
        for (let child of this.children) {
            child.startDate = null
            child.clearStartTime()
        }
    }

    private computeStartTime() {
        if (this.children.length == 0) {
            return
        }
        if (this.parents.length == 0) {
            this.startDate = this.estimatedStartDate
        }
        for (let child of this.children) {
            if (child.startDate == null) {
                let ends = child.parents.map((value: TaskNode) => {
                    let returned = new Date(value.startDate.valueOf())
                    returned.setDate(returned.getDate() + value.duration)
                    return returned
                })
                child.startDate = new Date(Math.max.apply(null, ends))
            }
        }
        for (let child of this.children) {
            child.recompute()
        }
    }
}

