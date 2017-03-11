import {IProjectNode} from "./iprojectnode"
import {ITaskNode} from "./itasknode"

export interface IDelayNode {
    readonly project: IProjectNode
    readonly delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
}
