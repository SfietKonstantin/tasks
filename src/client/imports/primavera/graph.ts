import * as maputils from "../../../common/maputils"
import { PrimaveraTaskRelation } from "./types"

export class RelationGraph {
    nodes: Map<string, RelationGraphNode>
    constructor() {
        this.nodes = new Map<string, RelationGraphNode>()
    }
    addRelation(relation: PrimaveraTaskRelation) {
        let previousNode = this.pushNode(relation.previous)
        let nextNode = this.pushNode(relation.next)
        if (previousNode.children.has(relation.next)
            || nextNode.children.has(relation.previous)) {
            throw new Error("Duplicated relation")
        }
        previousNode.children.set(relation.next, relation)
        nextNode.parents.set(relation.previous, relation)
    }
    private pushNode(identifier: string) {
        if (!this.nodes.has(identifier)) {
            this.nodes.set(identifier, {
                identifier,
                parents: new Map<string, PrimaveraTaskRelation>(),
                children: new Map<string, PrimaveraTaskRelation>()
            })
        }
        return maputils.get(this.nodes, identifier)
    }
}


export interface RelationGraphNode {
    identifier: string
    parents: Map<string, PrimaveraTaskRelation>
    children: Map<string, PrimaveraTaskRelation>
}

/*
export const buildGraph = (tasks: Array<ApiInputTask>, relations: Array<TaskRelation>): Graph => {
    let returned: Graph = {
        nodes: new Map<string, Node>()
    }

    tasks.forEach((task: ApiInputTask) => {
        returned.nodes.set(task.identifier, {
            parents: new Map<string, TaskRelation>(),
            children: new Map<string, TaskRelation>(),
            content: task
        })
    })

    relations.forEach((relation: TaskRelation) => {
        let previous = maputils.get(returned.nodes, relation.previous)
        let next = maputils.get(returned.nodes, relation.next)
        previous.children.set(relation.next, relation)
        next.parents.set(relation.previous, relation)
    })

    return returned
}

const mergeRelation = (relation1: TaskRelation, relation2: TaskRelation): TaskRelation => {
    if (relation1.previousLocation != relation2.previousLocation) {
        throw new Error(":(") // TODO
    }
    const previousLocation = relation1.previousLocation
    return {
        previous: relation1.previous,
        previousLocation,
        next: relation2.next,
        lag: relation1.lag + relation2.lag
    }
}

export const extractNode = (graph: Graph, identifier: string): Array<TaskRelation> | null => {
    if (!graph.nodes.has(identifier)) {
        return null
    }

    const node = maputils.get(graph.nodes, identifier)
    const returned = node.parents

    graph.nodes.delete(identifier)

    // Remap graph structure
    node.children.forEach((relation: TaskRelation) => {
        let child = maputils.get(graph.nodes, relation.next)
        child.parents.delete(identifier)

        node.parents.forEach((parentRelation: TaskRelation) => {
            child.parents.set(parentRelation.previous, mergeRelation(parentRelation, relation))
        })
    })

    node.parents.forEach((relation: TaskRelation) => {
        let parent = maputils.get(graph.nodes, relation.previous)
        parent.children.delete(identifier)

        node.children.forEach((childRelation: TaskRelation) => {
            parent.children.set(childRelation.next, mergeRelation(relation, childRelation))
        })
    })

    return Array.from(returned.values())
}
*/