import {ITaskNode} from "../itasknode"
import {IDelayNodeImpl} from "./idelaynode"
import {TaskRelation} from "../../../../common/old/taskrelation"
import {DelayRelation} from "../../../../common/old/delayrelation"

export interface ITaskNodeImpl extends ITaskNode {
    readonly estimatedStartDate: Date
    readonly estimatedDuration: number
    childrenRelations: Map<string, TaskRelation>
    parentsRelations: Map<string, TaskRelation>

    compute(): Promise<void>
    addChild(node: ITaskNodeImpl, relation: TaskRelation): Promise<void>
    addDelay(node: IDelayNodeImpl, relation: DelayRelation): void
    getEndDate(): Date
    markAndCompute(markedNodes: Set<ITaskNode>): Promise<void>
}