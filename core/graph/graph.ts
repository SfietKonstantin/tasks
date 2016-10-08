import { Task, TaskResults, Impact } from "../types"
import { CyclicDependencyError } from "./igraph"
import { TaskNode } from "./types"
import { IDataProvider, TaskNotFoundError } from "../data/idataprovider"

function buildGraphIndex(root: TaskNode, map: Map<string, TaskNode>): void {
    if (map.has(root.identifier)) {
        return
    }
    map.set(root.identifier, root)
    for (let child of root.children) {
        buildGraphIndex(child, map)
    }
}

function computeDuration(node: TaskNode) : void {
    node.duration = node.estimatedDuration
    node.duration += Math.max(node.impacts.reduce((previous: number, current: number) => {
        return previous + current
    }, 0), 0)
}

function defineStartDate(node: TaskNode) : void {
    if (!node.startDate) {
        node.startDate = new Date(node.estimatedStartDate.valueOf())
    }
}

export function compute(root: TaskNode): void {
    let map = new Map<string, TaskNode>()
    buildGraphIndex(root, map)
    
    // Compute durations and define start dates
    Array.from(map.values(), computeDuration)
    Array.from(map.values(), defineStartDate)

    // Compute start time
    let toBeComputed = new Set<string>(map.keys())
    toBeComputed.delete(root.identifier) // root should not be computed

    let queue = Array.from(toBeComputed)
    let deferred = new Array<string>()

    let lastDeferredLength = queue.length
    while (queue.length > 0 || deferred.length > 0) {
        if (queue.length == 0) {
            if (lastDeferredLength == deferred.length) {
                throw new CyclicDependencyError("Cyclic dependency found in graph")
            }
            lastDeferredLength = deferred.length
            queue = queue.concat(deferred)
            deferred.splice(0)
        }
        const id = queue.shift()
        let node = map.get(id)
        if (node.parents.filter((parent: TaskNode) => { return toBeComputed.has(parent.identifier)}).length > 0) {
            deferred.push(id)
        } else {
            let endDates = node.parents.map((parent: TaskNode) => {
                let returned = new Date(parent.startDate.valueOf())
                returned.setDate(returned.getDate() + parent.duration)
                return returned
            })
            endDates.push(node.startDate)
            node.startDate = new Date(Math.max.apply(null, endDates))
            toBeComputed.delete(id)
        }
    }
}

export class GraphPersistence {
    root: TaskNode
    nodes: Map<string, TaskNode>
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider
    }
    loadGraph(identifier: string) : Promise<void> {
        let nodes = new Map<string, TaskNode>()
        return this.loadNode(identifier, nodes).then(() => {
            let node = nodes.get(identifier)
            this.root = node
            this.nodes = nodes
        })
    }
    loadData() : Promise<void> {
        let impactMap = new Map<number, Array<string>>() // Map impact id to tasks
        return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
            return this.dataProvider.getTaskImpactIds(node.identifier).then((ids: Array<number>) => {
                ids.forEach((identifier: number) => {
                    if (!impactMap.has(identifier)) {
                        impactMap.set(identifier, new Array<string>())
                    }
                    impactMap.get(identifier).push(node.identifier)
                })
            })
        })).then(() => {
            let keys = Array.from(impactMap.keys()).sort()
            return this.dataProvider.getImpactsValues(keys).then((values: Array<number>) => {
                for (let i in keys) {
                    let impactId = keys[i]
                    let taskIds = impactMap.get(impactId)

                    taskIds.forEach((taskIdentifier: string) => {
                        this.nodes.get(taskIdentifier).impacts.push(values[i])
                    })
                }
            })
        }).then(() => {
            return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
                return this.dataProvider.getTaskResults(node.identifier).then((result: TaskResults) => {
                    node.startDate = result.startDate
                })
            }))
        }).then(() => {})
    }
    save() : Promise<void> {
        let taskResults = Array.from(this.nodes.values(), (task: TaskNode) => {
            let taskResult: TaskResults = {
                taskIdentifier: task.identifier,
                startDate: task.startDate,
                duration: task.duration
            }
            return taskResult
        })
        return this.dataProvider.setTasksResults(taskResults)
    }
    private loadNode(identifier: string, nodes: Map<string, TaskNode>) : Promise<void> {
        return this.dataProvider.getTask(identifier).then((task: Task) => {
            let node = new TaskNode(identifier)
            node.estimatedDuration = task.estimatedDuration
            node.estimatedStartDate = task.estimatedStartDate
            nodes.set(identifier, node)

            return this.dataProvider.getChildrenTaskIdentifiers(task.identifier).then((ids: Array<string>) => {
                const sorted = ids.sort().filter((value: string) => {
                    return !nodes.has(value)
                })
                return Promise.all(sorted.map((id: string) => {
                    return this.loadNode(id, nodes)
                })).then(() => {
                    sorted.forEach((id: string) => {
                        node.addChild(nodes.get(id))
                    })
                })
            })
        })
    }
}