import { Task, TaskResults, Modifier } from "../../../common/types"
import * as dateutils from "../../../common/dateutils"
import * as maputils from "../../../common/maputils"
import { CyclicDependencyError } from "./igraph"
import { TaskNode } from "./types"
import { IDataProvider, TaskNotFoundError } from "../data/idataprovider"

export class NotComputed extends Error implements Error {
    constructor(node: TaskNode) {
        super("StartDate or duration is computed for node " + node.taskIdentifier)
    }
}

export const buildGraphIndex = (root: TaskNode, map: Map<string, TaskNode>): void => {
    if (map.has(root.taskIdentifier)) {
        return
    }
    map.set(root.taskIdentifier, root)
    for (let child of root.children) {
        buildGraphIndex(child, map)
    }
}

const computeDuration = (node: TaskNode): void => {
    node.duration = node.estimatedDuration
    node.duration += Math.max(node.modifiers.reduce((previous: number, current: number) => {
        return previous + current
    }, 0), 0)
}

const defineStartDate = (node: TaskNode): void => {
    if (!node.startDate) {
        node.startDate = new Date(node.estimatedStartDate.getTime())
    }
}

const processMilestones = (node: TaskNode): void => {
    if (node.estimatedDuration === 0) {
        const initialDate = node.startDate as Date
        const initialDuration = node.duration as number
        node.startDate = dateutils.addDays(initialDate, initialDuration)
        node.duration = 0
    }
}

export const compute = (root: TaskNode): void => {
    let map = new Map<string, TaskNode>()
    buildGraphIndex(root, map)

    // Compute durations and define start dates
    Array.from(map.values(), computeDuration)
    Array.from(map.values(), defineStartDate)
    Array.from(map.values(), processMilestones)

    // Compute start time
    let toBeComputed = new Set<string>(map.keys())
    toBeComputed.delete(root.taskIdentifier) // root should not be computed

    let queue = Array.from(toBeComputed)
    let deferred = new Array<string>()

    let lastDeferredLength = queue.length
    while (queue.length > 0 || deferred.length > 0) {
        if (queue.length === 0) {
            if (lastDeferredLength === deferred.length) {
                throw new CyclicDependencyError("Cyclic dependency found in graph")
            }
            lastDeferredLength = deferred.length
            queue = queue.concat(deferred)
            deferred.splice(0)
        }
        const identifier = queue.shift() as string
        let node = maputils.get(map, identifier)
        if (node.parents.filter((parent: TaskNode) => { return toBeComputed.has(parent.taskIdentifier)}).length > 0) {
            deferred.push(identifier)
        } else {
            let endDates = node.parents.map((parent: TaskNode) => {
                const parentStartDate = parent.startDate as Date // Never null
                const parentDuration = parent.duration as number // Never null
                return dateutils.addDays(parentStartDate, parentDuration)
            })
            if (node.startDate != null) {
                endDates.push(node.startDate)
            }
            node.startDate = new Date(Math.max.apply(null, endDates))
            toBeComputed.delete(identifier)
        }
    }
}

export class GraphPersistence {
    projectIdentifier: string
    root: TaskNode
    nodes: Map<string, TaskNode>
    private dataProvider: IDataProvider
    constructor(projectIdentifier: string, dataProvider: IDataProvider) {
        this.projectIdentifier = projectIdentifier
        this.dataProvider = dataProvider
    }
    loadGraph(taskIdentifier: string): Promise<void> {
        let nodes = new Map<string, TaskNode>()
        return this.loadNode(taskIdentifier, nodes).then(() => {
            let node = maputils.get(nodes, taskIdentifier)
            this.root = node
            this.nodes = nodes
        })
    }
    loadData(): Promise<void> {
        let modifierMap = new Map<number, Array<string>>() // Map modifier id to tasks
        return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
            return this.dataProvider.getTaskModifierIds(this.projectIdentifier, node.taskIdentifier)
                                    .then((ids: Array<number>) => {
                ids.forEach((id: number) => {
                    if (!modifierMap.has(id)) {
                        modifierMap.set(id, new Array<string>())
                    }
                    let modifier = maputils.get(modifierMap, id)
                    modifier.push(node.taskIdentifier)
                })
            })
        })).then(() => {
            let keys = Array.from(modifierMap.keys()).sort()
            return this.dataProvider.getModifiersValues(this.projectIdentifier, keys).then((values: Array<number>) => {
                for (let i in keys) {
                    let modifierId = keys[i]
                    const taskIds = maputils.get(modifierMap, modifierId)

                    taskIds.forEach((taskIdentifier: string) => {
                        let taskNode = maputils.get(this.nodes, taskIdentifier)
                        taskNode.modifiers.push(values[i])
                    })
                }
            })
        }).then(() => {
            return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
                return this.dataProvider.getTaskResults(this.projectIdentifier, node.taskIdentifier)
                                        .then((result: TaskResults) => {
                    node.startDate = result.startDate
                    node.duration = result.duration
                })
            }))
        }).then(() => {})
    }
    save(): Promise<void> {
        let taskResults = Array.from(this.nodes.values(), (task: TaskNode) => {
            if (task.startDate == null || task.duration == null) {
                throw new NotComputed(task)
            }
            let taskResult: TaskResults = {
                projectIdentifier: this.projectIdentifier,
                taskIdentifier: task.taskIdentifier,
                startDate: task.startDate,
                duration: task.duration
            }
            return taskResult
        })
        return Promise.all(taskResults.map(this.dataProvider.setTaskResults.bind(this.dataProvider)))
    }
    private loadNode(taskIdentifier: string, nodes: Map<string, TaskNode>): Promise<void> {
        return this.dataProvider.getTask(this.projectIdentifier, taskIdentifier).then((task: Task) => {
            let node = new TaskNode(taskIdentifier, task.estimatedStartDate, task.estimatedDuration)
            nodes.set(taskIdentifier, node)

            return this.dataProvider.getChildrenTaskIdentifiers(this.projectIdentifier, task.identifier)
                                    .then((ids: Array<string>) => {
                const sorted = ids.sort().filter((value: string) => {
                    return !nodes.has(value)
                })
                return Promise.all(sorted.map((id: string) => {
                    return this.loadNode(id, nodes)
                })).then(() => {
                    sorted.forEach((id: string) => {
                        node.addChild(maputils.get(nodes, id))
                    })
                })
            })
        })
    }
}
