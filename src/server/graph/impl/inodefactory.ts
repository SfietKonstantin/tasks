import {Graph} from "./graph"
import {IProjectNode} from "../iprojectnode"
import {IProjectNodeImpl} from "./iprojectnode"
import {ITaskNodeImpl} from "./itasknode"
import {IDelayNodeImpl} from "./idelaynode"
import {IDaoBuilder} from "../../dao/ibuilder"

export interface INodeFactory {
    createProjectNode(daoBuilder: IDaoBuilder, parent: Graph, projectIdentifier: string): IProjectNodeImpl
    createTaskNode(daoBuilder: IDaoBuilder, parent: IProjectNode, taskIdentifier: string,
                   estimatedStartDate: Date, estimatedDuration: number): ITaskNodeImpl
    createDelayNode(parent: IProjectNode, delayIdentifier: string, date: Date): IDelayNodeImpl
}
