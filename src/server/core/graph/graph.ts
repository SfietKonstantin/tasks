import { Project, Task, TaskRelation, TaskResults, TaskLocation, Modifier } from "../../../common/types"
import { GraphError, ITaskNode, IProjectNode, IGraph } from "./types"
import { IDataProvider } from "../data/idataprovider"
import * as dateutils from "../../../common/dateutils"
import * as maputils from "../../../common/maputils"

export class TaskNode implements ITaskNode {
    projectIdentifier: string
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    modifiers: Array<Modifier>
    private dataProvider: IDataProvider
    private estimatedStartDate: Date
    private estimatedDuration: number
    private childrenRelations: Map<string, TaskRelation>
    private parentsRelations: Map<string, TaskRelation>
    constructor(dataProvider: IDataProvider,
                projectIdentifier: string, taskIdentifier: string,
                estimatedStartDate: Date, estimatedDuration: number,
                startDate: Date, duration: number) {
        this.dataProvider = dataProvider
        this.projectIdentifier = projectIdentifier
        this.taskIdentifier = taskIdentifier
        this.estimatedStartDate = estimatedStartDate
        this.estimatedDuration = estimatedDuration
        this.startDate = startDate
        this.duration = duration
        this.children = new Array<ITaskNode>()
        this.parents = new Array<ITaskNode>()
        this.modifiers = new Array<Modifier>()
        this.childrenRelations = new Map<string, TaskRelation>()
        this.parentsRelations = new Map<string, TaskRelation>()
    }
    compute(): Promise<void> {
        return this.markAndCompute(new Set<ITaskNode>())
    }
    addModifier(modifier: Modifier): Promise<Modifier> {
        if (modifier.projectIdentifier !== this.projectIdentifier) {
            return Promise.reject(new GraphError("Invalid project for modifier"))
        }
        return this.dataProvider.addModifier(modifier).then((id: number) => {
            return this.dataProvider.setModifierForTask(this.projectIdentifier, id, this.taskIdentifier)
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
    getEndDate(): Date {
        return dateutils.addDays(this.startDate, this.duration)
    }
    private markAndCompute(markedNodes: Set<ITaskNode>) {
        return Promise.resolve().then(() => {
            if (markedNodes.has(this)) {
                throw new GraphError("Cyclic dependency found")
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
            let parentEndDates = this.parents.map((node: ITaskNode) => { return (node as TaskNode).getEndDate() })
            parentEndDates.push(this.estimatedStartDate)
            parentEndDates = parentEndDates.filter((value: Date) => {
                return !Number.isNaN(value.getTime())
            })

            if (parentEndDates.length === 0) {
                throw new GraphError("Invalid input")
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
            return this.computeChildren(markedNodes).then(() => {
                // Then save results
                return this.dataProvider.setTaskResults({
                    projectIdentifier: this.projectIdentifier,
                    taskIdentifier: this.taskIdentifier,
                    startDate: this.startDate,
                    duration: this.duration
                })
            })
        }).then(() => {
            markedNodes.delete(this)
        })
    }
    private computeChildren(markedNodes: Set<ITaskNode>): Promise<void> {
        return Promise.all(this.children.map((child: TaskNode) => {
            return child.markAndCompute(markedNodes)
        }))
    }
}

export class ProjectNode implements IProjectNode {
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider, projectIdentifier: string) {
        this.dataProvider = dataProvider
        this.projectIdentifier = projectIdentifier
        this.nodes = new Map<string, ITaskNode>()
    }
    load(): Promise<void> {
        return this.dataProvider.getProjectTasks(this.projectIdentifier).then((tasks: Array<Task>) => {
            return Promise.all(tasks.map((task: Task) => {
                return this.dataProvider.getTaskResults(task.projectIdentifier, task.identifier)
                           .then((results: TaskResults) => {
                    const node = new TaskNode(this.dataProvider, task.projectIdentifier, task.identifier,
                                              task.estimatedStartDate, task.estimatedDuration,
                                              results.startDate, results.duration)
                    this.nodes.set(task.identifier, node)
                })
            })).then(() => {
                return Promise.all(Array.from(this.nodes.values(), (node: ITaskNode) => {
                    return this.dataProvider.getTaskModifiers(node.projectIdentifier, node.taskIdentifier)
                               .then((modifiers: Array<Modifier>) => {
                        node.modifiers = modifiers
                    })
                }))
            }).then(() => {
                return Promise.all(Array.from(this.nodes.values(), (node: ITaskNode) => {
                    return this.dataProvider.getTaskRelations(node.projectIdentifier, node.taskIdentifier)
                               .then((taskRelations: Array<TaskRelation>) => {
                        taskRelations.forEach((taskRelation: TaskRelation) => {
                            const child = maputils.get(this.nodes, taskRelation.next) as TaskNode
                            let taskNode = node as TaskNode
                            taskNode.addChild(child, taskRelation)
                        })
                    })
                }))
            })
        })
    }
    addTask(task: Task): Promise<ITaskNode> {
        if (task.projectIdentifier !== this.projectIdentifier) {
            return Promise.reject(new GraphError("Invalid project for task"))
        }
        if (this.nodes.has(task.identifier)) {
            return Promise.reject(new GraphError("Task is already present in project"))
        }
        return this.dataProvider.addTask(task).then(() => {
            const taskResults: TaskResults = {
                projectIdentifier: task.projectIdentifier,
                taskIdentifier: task.identifier,
                startDate: task.estimatedStartDate,
                duration: task.estimatedDuration
            }
            return this.dataProvider.setTaskResults(taskResults)
        }).then(() => {
            const node = new TaskNode(this.dataProvider, task.projectIdentifier, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        task.estimatedStartDate, task.estimatedDuration)
            this.nodes.set(task.identifier, node)
            return node
        })
    }
    addRelation(relation: TaskRelation): Promise<void> {
        if (!this.nodes.has(relation.previous)) {
            return Promise.reject(new GraphError("Task is not present in project"))
        }
        if (!this.nodes.has(relation.next)) {
            return Promise.reject(new GraphError("Task is not present in project"))
        }
        return this.dataProvider.addTaskRelation(relation)
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
                let node = new ProjectNode(this.dataProvider, project.identifier)
                return node.load().then(() => {
                    this.nodes.set(project.identifier, node)
                })
            }))
        })
    }
    addProject(project: Project): Promise<IProjectNode> {
        if (this.nodes.has(project.identifier)) {
            return Promise.reject(new GraphError("Project is already present in graph"))
        }
        return this.dataProvider.addProject(project).then(() => {
            const node = new ProjectNode(this.dataProvider, project.identifier)
            this.nodes.set(project.identifier, node)
            return node
        })
    }
}
