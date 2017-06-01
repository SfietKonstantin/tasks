import {IDelayNodeImpl} from "./idelaynode"
import {IProjectNode} from "../iprojectnode"
import {ITaskNode} from "../itasknode"
import {DelayRelation} from "../../../common/old/delayrelation"
import {ITaskNodeImpl} from "./itasknode"
import {get as mapGet} from "../../../common/utils/map"
import {addDays, diffDates} from "../../../common/utils/date"

export class DelayNode implements IDelayNodeImpl {
    readonly project: IProjectNode
    readonly delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
    relations: Map<string, DelayRelation>
    private readonly date: Date

    constructor(project: IProjectNode, delayIdentifier: string, date: Date) {
        this.project = project
        this.delayIdentifier = delayIdentifier
        this.initialMargin = 0
        this.margin = 0
        this.date = date
        this.tasks = []
        this.relations = new Map<string, DelayRelation>()
    }

    compute() {
        const initialMargins = this.tasks.map((node: ITaskNodeImpl) => {
            const relation = mapGet(this.relations, node.taskIdentifier)
            const diff = diffDates(addDays(node.estimatedStartDate, node.estimatedDuration), this.date)
            return diff - relation.lag
        })
        this.initialMargin = Math.min(...initialMargins)
        const margins = this.tasks.map((node: ITaskNode) => {
            const relation = mapGet(this.relations, node.taskIdentifier)
            const diff = diffDates(addDays(node.startDate, node.duration), this.date)
            return diff - relation.lag
        })
        this.margin = Math.min(...margins)
    }
}
