import {IProjectNode} from "./iprojectnode"
import {ITaskNode} from "./itasknode"

export interface IDelayNode {
    project: IProjectNode
    delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
}
