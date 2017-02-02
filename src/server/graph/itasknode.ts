import {IProjectNode} from "./iprojectnode"
import {IDelayNode} from "./idelaynode"
import {Modifier} from "../../common/modifier"

export interface ITaskNode {
    project: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    delays: Array<IDelayNode>
    modifiers: Array<Modifier>
    addModifier(modifier: Modifier): Promise<Modifier>
}
