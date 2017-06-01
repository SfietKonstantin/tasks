import {IGraph} from "./igraph"
import {ITaskNode} from "./itasknode"
import {IDelayNode} from "./idelaynode"
import {TaskDefinition} from "../../common/old/task"
import {DelayDefinition} from "../../common/old/delay"
import {TaskRelation} from "../../common/old/taskrelation"
import {DelayRelation} from "../../common/old/delayrelation"

export interface IProjectNode {
    readonly graph: IGraph
    readonly projectIdentifier: string
    tasks: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>
    addTask(task: TaskDefinition): Promise<ITaskNode>
    addDelay(delay: DelayDefinition): Promise<IDelayNode>
    addTaskRelation(relation: TaskRelation): Promise<void>
    addDelayRelation(relation: DelayRelation): Promise<void>
}
