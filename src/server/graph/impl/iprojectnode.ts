import {IProjectNode} from "../iprojectnode"

export interface IProjectNodeImpl extends IProjectNode {
    load(): Promise<void>
}
