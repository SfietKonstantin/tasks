import { Task, TaskResults, Impact } from "../types"
import { CyclicDependencyError } from "./igraph"
import { TaskNode } from "./types"
import { IDataProvider, TaskNotFoundError } from "../data/idataprovider"

function buildGraphIndex(root: TaskNode, map: Map<number, TaskNode>): void {
    if (map.has(root.id)) {
        return
    }
    map.set(root.id, root)
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
    let map = new Map<number, TaskNode>()
    buildGraphIndex(root, map)
    
    // Compute durations and define start dates
    Array.from(map.values(), computeDuration)
    Array.from(map.values(), defineStartDate)

    // Compute start time
    let toBeComputed = new Set<number>(map.keys())
    toBeComputed.delete(root.id) // root should not be computed

    let queue = Array.from(toBeComputed)
    let deferred = new Array<number>()

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
        if (node.parents.filter((parent: TaskNode) => { return toBeComputed.has(parent.id)}).length > 0) {
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
    nodes: Map<number, TaskNode>
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider
    }
    loadGraph(id: number) : Promise<void> {
        let nodes = new Map<number, TaskNode>()
        return this.loadNode(id, nodes).then(() => {
            let node = nodes.get(id)
            this.root = node
            this.nodes = nodes
        })
    }
    loadData() : Promise<void> {
        let impactMap = new Map<number, Array<number>>() // Map impact id to tasks
        return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
            return this.dataProvider.getTaskImpactIds(node.id).then((ids: Array<number>) => {
                ids.forEach((id: number) => {
                    if (!impactMap.has(id)) {
                        impactMap.set(id, new Array<number>())
                    }
                    impactMap.get(id).push(node.id)
                })
            })
        })).then(() => {
            let keys = Array.from(impactMap.keys()).sort()
            return this.dataProvider.getImpactsValues(keys).then((values: Array<number>) => {
                for (let i in keys) {
                    let impactId = keys[i]
                    let taskIds = impactMap.get(impactId)

                    taskIds.forEach((taskId: number) => {
                        this.nodes.get(taskId).impacts.push(values[i])
                    })
                }
            })
        }).then(() => {
            return Promise.all(Array.from(this.nodes.values(), (node: TaskNode) => {
                return this.dataProvider.getTaskResults(node.id).then((result: TaskResults) => {
                    node.startDate = result.startDate
                })
            }))
        }).then(() => {})
    }
    save() : Promise<void> {
        let taskResults = Array.from(this.nodes.values(), (task: TaskNode) => {
            let taskResult: TaskResults = {
                taskId: task.id,
                startDate: task.startDate,
                duration: task.duration
            }
            return taskResult
        })
        return this.dataProvider.setTasksResults(taskResults)
    }
    private loadNode(id: number, nodes: Map<number, TaskNode>) : Promise<void> {
        if (nodes.has(id)) {
            return
        } else {
            return this.dataProvider.getTask(id).then((task: Task) => {
                let node = new TaskNode(id)
                node.estimatedDuration = task.estimatedDuration
                node.estimatedStartDate = task.estimatedStartDate
                nodes.set(id, node)

                return this.dataProvider.getChildrenTaskIds(task.id).then((ids: Array<number>) => {
                    const sorted = ids.sort(GraphPersistence.compareNumbers)
                    return Promise.all(sorted.map((id: number) => {
                        return this.loadNode(id, nodes)
                    })).then(() => {
                        sorted.forEach((id: number) => {
                            node.addChild(nodes.get(id))
                        })
                    })
                })
            })
        }
    }
    private static compareNumbers(first: number, second: number) : number {
        return first - second
    }
}