import * as winston from "winston"
import {GraphError} from "./error/graph"
import {TaskDefinition} from "../../common/task"
import {TaskRelation} from "../../common/taskrelation"
import {get as mapGet} from "../../common/utils/map"

interface Node {
    readonly taskIdentifier: string
    children: Array<Node>
}

const markAndProcessChildren = (node: Node, marked: Set<string>, nodes: Map<string, Node>) => {
    if (marked.has(node.taskIdentifier)) {
        winston.error("Cyclic dependency found for nodes")
        winston.error(Array.from(marked.values(), (node: string) => {
            return node
        }).join(" "))
        throw new GraphError("Cyclic dependency found")
    }

    marked.add(node.taskIdentifier)
    node.children.forEach((child: Node) => {
        if (nodes.has(child.taskIdentifier)) {
            markAndProcessChildren(child, marked, nodes)
        }
    })
    nodes.delete(node.taskIdentifier)
}

export const findCyclicDependency = (tasks: Array<TaskDefinition>, relations: Array<TaskRelation>) => {
    let nodes = new Map<string, Node>()
    tasks.forEach((task: TaskDefinition) => {
        nodes.set(task.identifier, {
            taskIdentifier: task.identifier,
            children: []
        })
    })

    relations.forEach((relation: TaskRelation) => {
        if (!nodes.has(relation.previous) || !nodes.has(relation.next)) {
            return
        }
        let parent = mapGet(nodes, relation.previous)
        const child = mapGet(nodes, relation.next)
        parent.children.push(child)
    })

    while (nodes.size > 0) {
        const key = Array.from(nodes.keys())[0]
        markAndProcessChildren(mapGet(nodes, key), new Set<string>(), nodes)
    }
}
