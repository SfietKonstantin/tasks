import {IGraph} from "./igraph"
import {ITaskNode} from "./itasknode"
import {IDelayNode} from "./idelaynode"
import {TaskDefinition} from "../../common/task"
import {DelayDefinition} from "../../common/delay"
import {TaskRelation} from "../../common/taskrelation"
import {DelayRelation} from "../../common/delayrelation"

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
