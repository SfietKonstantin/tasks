import * as winston from "winston"
import {
    Project, TaskDefinition, TaskRelation, TaskLocation, Modifier, DelayDefinition, DelayRelation
} from "../../../common/types"
import { ExistsError, NotFoundError } from "../../../common/errors"
import { GraphError, ITaskNode, IDelayNode, IProjectNode, IGraph } from "./types"
import { IDataProvider } from "../data/idataprovider"
import * as dateutils from "../../../common/dateutils"
import * as maputils from "../../../common/maputils"

export class TaskNode implements ITaskNode {
    parent: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    delays: Array<IDelayNode>
    modifiers: Array<Modifier>
    estimatedStartDate: Date
    estimatedDuration: number
    private dataProvider: IDataProvider
    private childrenRelations: Map<string, TaskRelation>
    private parentsRelations: Map<string, TaskRelation>
    constructor(dataProvider: IDataProvider,
                parent: IProjectNode, taskIdentifier: string,
                estimatedStartDate: Date, estimatedDuration: number) {
        this.dataProvider = dataProvider
        this.parent = parent
        this.taskIdentifier = taskIdentifier
        this.estimatedStartDate = new Date(estimatedStartDate.getTime())
        this.estimatedDuration = estimatedDuration
        this.startDate = new Date(estimatedStartDate.getTime())
        this.duration = estimatedDuration
        this.children = []
        this.parents = []
        this.delays = []
        this.modifiers = []
        this.childrenRelations = new Map<string, TaskRelation>()
        this.parentsRelations = new Map<string, TaskRelation>()
    }
    compute(): Promise<void> {
        return this.markAndCompute(new Set<ITaskNode>())
    }
    addModifier(modifier: Modifier): Promise<Modifier> {
        const projectIdentifier = this.parent.projectIdentifier
        return this.dataProvider.addModifier(projectIdentifier, modifier).then((id: number) => {
            return this.dataProvider.addModifierForTask(projectIdentifier, id, this.taskIdentifier)
        }).then(() => {
            this.modifiers.push(modifier)
            return this.compute()
        }).then(() => {
            return modifier
        })
    }
    addChild(node: TaskNode, relation: TaskRelation): Promise<void> {
        this.children.push(node)
        this.childrenRelations.set(node.taskIdentifier, relation)
        node.parents.push(this)
        node.parentsRelations.set(this.taskIdentifier, relation)
        return this.computeChildren(new Set<ITaskNode>())
    }
    addDelay(node: DelayNode, relation: DelayRelation) {
        this.delays.push(node)
        node.relations.set(this.taskIdentifier, relation)
        node.tasks.push(this)
        return this.computeDelays()
    }
    getEndDate(): Date {
        return dateutils.addDays(this.startDate, this.duration)
    }
    private markAndCompute(markedNodes: Set<ITaskNode>) {
        return Promise.resolve().then(() => {
            if (markedNodes.has(this)) {
                const markedTasks = Array.from(markedNodes, (node: ITaskNode) => {
                    return "\"" + node.taskIdentifier + "\""
                }).join(", ")
                throw new GraphError("Cyclic dependency found involving task " + markedTasks)
            }
            markedNodes.add(this)
            const currentEndDate = this.getEndDate()

            // Compute duration
            const beginningDurations = this.modifiers.map((modifier: Modifier) => {
                return modifier.location === TaskLocation .Beginning ? modifier.duration : 0
            })
            const beginningSum = beginningDurations.reduce((first: number, second: number) => {
                return first + second
            }, 0)

            const endDurations = this.modifiers.map((modifier: Modifier) => {
                return modifier.location === TaskLocation .End ? modifier.duration : 0
            })
            const endSum = endDurations.reduce((first: number, second: number) => {
                return first + second
            }, 0)

            this.duration = this.estimatedDuration + Math.max(endSum, 0)

            // Compute start date
            let parentEndDates = this.parents.map((node: ITaskNode) => {
                const relation = maputils.get(this.parentsRelations, node.taskIdentifier)
                if (relation.previousLocation === TaskLocation.Beginning) {
                    return dateutils.addDays(node.startDate, relation.lag)
                } else {
                    return dateutils.addDays((node as TaskNode).getEndDate(), relation.lag)
                }
            })
            parentEndDates.push(this.estimatedStartDate)
            parentEndDates = parentEndDates.filter((value: Date) => {
                return !Number.isNaN(value.getTime())
            })

            if (parentEndDates.length === 0) {
                throw new GraphError("Task \"" + this.taskIdentifier + "\" contains invalid parent dates")
            }
            this.startDate = dateutils.addDays(new Date(Math.max.apply(null, parentEndDates)),
                                               Math.max(beginningSum, 0))

            // Take milestones in account
            if (this.estimatedDuration === 0) {
                this.startDate = dateutils.addDays(this.startDate, this.duration)
                this.duration = 0
            }

            // No need to save / compute children if nothing changed
            const newEndDate = this.getEndDate()
            if (newEndDate.getTime() === currentEndDate.getTime()) {
                return false
            }
            return true
        }).then((shouldCompute: boolean) => {
            if (!shouldCompute) {
                return
            }

            // Try computing children first
            const projectIdentifier = this.parent.projectIdentifier
            return this.computeChildren(markedNodes).then(() => {
                // Then compute delays
                this.computeDelays()
            }).then(() => {
            })
        }).then(() => {
            markedNodes.delete(this)
        })
    }
    private computeChildren(markedNodes: Set<ITaskNode>): Promise<void> {
        return Promise.all(this.children.map((child: TaskNode) => {
            return child.markAndCompute(new Set<ITaskNode>(markedNodes))
        }))
    }
    private computeDelays() {
        this.delays.forEach((delay: IDelayNode) => {
            (delay as DelayNode).compute()
        })
    }
}

export class DelayNode implements IDelayNode {
    parent: IProjectNode
    delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
    relations: Map<string, DelayRelation>
    private dataProvider: IDataProvider
    private date: Date
    constructor(dataProvider: IDataProvider,
                parent: IProjectNode, delayIdentifier: string, date: Date) {
        this.dataProvider = dataProvider
        this.parent = parent
        this.delayIdentifier = delayIdentifier
        this.initialMargin = 0
        this.margin = 0
        this.date = date
        this.tasks = []
        this.relations = new Map<string, DelayRelation>()
    }
    compute() {
        const initialMargins = this.tasks.map((node: TaskNode) => {
            const relation = maputils.get(this.relations, node.taskIdentifier)
            const diff = dateutils.getDateDiff(dateutils.addDays(node.estimatedStartDate,
                                                                 node.estimatedDuration),
                                               this.date)
            return diff - relation.lag
        })
        this.initialMargin = Math.min(...initialMargins)
        const margins = this.tasks.map((node: ITaskNode) => {
            const relation = maputils.get(this.relations, node.taskIdentifier)
            const diff = dateutils.getDateDiff(dateutils.addDays(node.startDate, node.duration), this.date)
            return diff - relation.lag
        })
        this.margin = Math.min(...margins)
    }
}

export class ProjectNode implements IProjectNode {
    parent: IGraph
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider, parent: IGraph, projectIdentifier: string) {
        this.dataProvider = dataProvider
        this.parent = parent
        this.projectIdentifier = projectIdentifier
        this.nodes = new Map<string, ITaskNode>()
        this.delays = new Map<string, IDelayNode>()
    }
    load(): Promise<void> {
        winston.info("Loading graph for project \"" + this.projectIdentifier + "\"")
        return this.dataProvider.getProjectTasks(this.projectIdentifier).then((tasks: Array<TaskDefinition>) => {
            return Promise.all(tasks.map((task: TaskDefinition) => {
                const node = new TaskNode(this.dataProvider, this, task.identifier,
                                          task.estimatedStartDate, task.estimatedDuration)
                this.nodes.set(task.identifier, node)
            }))
        }).then(() => {
            return this.dataProvider.getProjectDelays(this.projectIdentifier).then((delays: Array<DelayDefinition>) => {
                delays.forEach((delay: DelayDefinition) => {
                    const node = new DelayNode(this.dataProvider, this, delay.identifier, delay.date)
                    this.delays.set(delay.identifier, node)
                })
            })
        }).then(() => {
            return Promise.all(Array.from(this.nodes.values(), (node: ITaskNode) => {
                return this.dataProvider.getTaskModifiers(this.projectIdentifier, node.taskIdentifier)
                           .then((modifiers: Array<Modifier>) => {
                    node.modifiers = modifiers
                })
            }))
        }).then(() => {
            return Promise.all(Array.from(this.nodes.values(), (node: ITaskNode) => {
                return this.dataProvider.getTaskRelations(this.projectIdentifier, node.taskIdentifier)
                           .then((taskRelations: Array<TaskRelation>) => {
                    taskRelations.forEach((taskRelation: TaskRelation) => {
                        const child = maputils.get(this.nodes, taskRelation.next) as TaskNode
                        let taskNode = node as TaskNode
                        taskNode.addChild(child, taskRelation)
                    })
                })
            }))
        }).then(() => {
            return Promise.all(Array.from(this.delays.values(), (node: IDelayNode) => {
                return this.dataProvider.getDelayRelations(this.projectIdentifier, node.delayIdentifier)
                           .then((delayRelations: Array<DelayRelation>) => {
                    delayRelations.forEach((delayRelation: DelayRelation) => {
                        const task = maputils.get(this.nodes, delayRelation.task) as TaskNode
                        let delayNode = node as DelayNode
                        task.addDelay(delayNode, delayRelation)
                    })
                })
            }))
        }).then(() => {
            winston.info("Graph loaded for project \"" + this.projectIdentifier + "\"")
            winston.info("Tasks: " + this.nodes.size)
            winston.info("Delays: " + this.delays.size)

            return Promise.all(Array.from(this.nodes.values(), (node: ITaskNode) => {
                return (node as TaskNode).compute()
            }))
        }).then(() => {
            winston.info("Graph computed for project \"" + this.projectIdentifier + "\"")
        })
    }
    addTask(task: TaskDefinition): Promise<ITaskNode> {
        if (this.nodes.has(task.identifier)) {
            return Promise.reject(new ExistsError("Task \"" + task.identifier + "\" is already present in project"))
        }
        return this.dataProvider.addTask(this.projectIdentifier, task).then(() => {
            const node = new TaskNode(this.dataProvider, this, task.identifier,
                                      task.estimatedStartDate, task.estimatedDuration)
            this.nodes.set(task.identifier, node)
            return node
        })
    }
    addDelay(delay: DelayDefinition): Promise<IDelayNode> {
        if (this.delays.has(delay.identifier)) {
            return Promise.reject(new ExistsError("Delay \"" + delay.identifier + "\" is already present in project"))
        }
        return this.dataProvider.addDelay(this.projectIdentifier, delay).then(() => {
            const node = new DelayNode(this.dataProvider, this, delay.identifier, delay.date)
            this.delays.set(delay.identifier, node)
            return node
        })
    }
    addTaskRelation(relation: TaskRelation): Promise<void> {
        if (!this.nodes.has(relation.previous)) {
            return Promise.reject(new NotFoundError("Task \"" + relation.previous + "\" is not present in project"))
        }
        if (!this.nodes.has(relation.next)) {
            return Promise.reject(new NotFoundError("Task \"" + relation.next + "\" is not present in project"))
        }

        return this.dataProvider.addTaskRelation(this.projectIdentifier, relation).then(() => {
            const child = maputils.get(this.nodes, relation.next) as TaskNode
            let taskNode = maputils.get(this.nodes, relation.previous) as TaskNode
            return taskNode.addChild(child, relation)
        })
    }
    addDelayRelation(relation: DelayRelation): Promise<void> {
        if (!this.nodes.has(relation.task)) {
            return Promise.reject(new NotFoundError("Task \"" + relation.task + "\" is not present in project"))
        }
        if (!this.delays.has(relation.delay)) {
            return Promise.reject(new NotFoundError("Delay \"" + relation.delay + "\" is not present in project"))
        }

        return this.dataProvider.addDelayRelation(this.projectIdentifier, relation).then(() => {
            const delay = maputils.get(this.delays, relation.delay) as DelayNode
            let taskNode = maputils.get(this.nodes, relation.task) as TaskNode
            return taskNode.addDelay(delay, relation)
        })
    }
}

export class Graph implements IGraph {
    nodes: Map<string, IProjectNode>
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider
        this.nodes = new Map<string, IProjectNode>()
    }
    load(): Promise<void> {
        return this.dataProvider.getAllProjects().then((projects: Array<Project>) => {
            return Promise.all(projects.map((project: Project) => {
                let node = new ProjectNode(this.dataProvider, this, project.identifier)
                return node.load().then(() => {
                    this.nodes.set(project.identifier, node)
                })
            }))
        })
    }
    addProject(project: Project): Promise<IProjectNode> {
        if (this.nodes.has(project.identifier)) {
            return Promise.reject(new ExistsError("Project \"" + project.identifier + "\" is already present"))
        }
        return this.dataProvider.addProject(project).then(() => {
            const node = new ProjectNode(this.dataProvider, this, project.identifier)
            this.nodes.set(project.identifier, node)
            return node
        })
    }
}
