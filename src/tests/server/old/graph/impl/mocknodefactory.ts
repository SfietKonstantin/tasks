import {INodeFactory} from "../../../../../server/old/graph/impl/inodefactory"
import {IDaoBuilder} from "../../../../../server/old/dao/ibuilder"
import {Graph} from "../../../../../server/old/graph/impl/graph"
import {IProjectNode} from "../../../../../server/old/graph/iprojectnode"
import {IProjectNodeImpl} from "../../../../../server/old/graph/impl/iprojectnode"
import {ITaskNodeImpl} from "../../../../../server/old/graph/impl/itasknode"
import {IDelayNodeImpl} from "../../../../../server/old/graph/impl/idelaynode"

export class MockNodeFactory implements INodeFactory {
    createProjectNode(daoBuilder: IDaoBuilder, parent: Graph, projectIdentifier: string): IProjectNodeImpl {
        throw new Error("MockNodeFactory: createProjectNode is not mocked")
    }

    createTaskNode(daoBuilder: IDaoBuilder, parent: IProjectNode, taskIdentifier: string,
                   estimatedStartDate: Date, estimatedDuration: number): ITaskNodeImpl {
        throw new Error("MockNodeFactory: createTaskNode is not mocked")
    }

    createDelayNode(parent: IProjectNode, delayIdentifier: string, date: Date): IDelayNodeImpl {
        throw new Error("MockNodeFactory: createDelayNode is not mocked")
    }
}
