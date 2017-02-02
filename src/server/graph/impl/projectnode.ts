import * as winston from "winston"
import {IProjectNodeImpl} from "./iprojectnode"
import {INodeFactory} from "./inodefactory"
import {IDaoBuilder} from "../../dao/ibuilder"
import {ITaskDao} from "../../dao/itask"
import {ITaskRelationDao} from "../../dao/itaskrelation"
import {IDelayDao} from "../../dao/idelay"
import {IModifierDao} from "../../dao/imodifier"
import {IGraph} from "../igraph"
import {ITaskNode} from "../itasknode"
import {ITaskNodeImpl} from "./itasknode"
import {IDelayNode} from "../idelaynode"
import {TaskDefinition} from "../../../common/task"
import {DelayDefinition} from "../../../common/delay"
import {Modifier} from "../../../common/modifier"
import {TaskRelation} from "../../../common/taskrelation"
import {IDelayRelationDao} from "../../dao/idelayrelation"
import {DelayRelation} from "../../../common/delayrelation"
import {ExistsError} from "../../error/exists"
import {NotFoundError} from "../../../common/errors/notfound"
import {get as mapGet} from "../../../common/utils/map"
import {IDelayNodeImpl} from "./idelaynode"

export class ProjectNode implements IProjectNodeImpl {
    graph: IGraph
    projectIdentifier: string
    tasks: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>
    private nodeFactory: INodeFactory
    private daoBuilder: IDaoBuilder
    private taskDao: ITaskDao
    private delayDao: IDelayDao
    private taskRelationDao: ITaskRelationDao
    private delayRelationDao: IDelayRelationDao
    private modifierDao: IModifierDao
    constructor(nodeFactory: INodeFactory, daoBuilder: IDaoBuilder, graph: IGraph, projectIdentifier: string) {
        this.nodeFactory = nodeFactory
        this.daoBuilder = daoBuilder
        this.taskDao = daoBuilder.buildTaskDao()
        this.delayDao = daoBuilder.buildDelayDao()
        this.taskRelationDao = daoBuilder.buildTaskRelationDao()
        this.delayRelationDao = daoBuilder.buildDelayRelationDao()
        this.modifierDao = daoBuilder.buildModifierDao()
        this.graph = graph
        this.projectIdentifier = projectIdentifier
        this.tasks = new Map<string, ITaskNode>()
        this.delays = new Map<string, IDelayNode>()
    }
    load(): Promise<void> {
        winston.info(`Loading graph for project "${this.projectIdentifier}"`)
        return this.taskDao.getProjectTasks(this.projectIdentifier).then((tasks: Array<TaskDefinition>) => {
            return Promise.all(tasks.map((task: TaskDefinition) => {
                const node = this.nodeFactory.createTaskNode(this.daoBuilder, this, task.identifier,
                    task.estimatedStartDate, task.estimatedDuration)
                this.tasks.set(task.identifier, node)
            }))
        }).then(() => {
            return this.delayDao.getProjectDelays(this.projectIdentifier).then((delays: Array<DelayDefinition>) => {
                delays.forEach((delay: DelayDefinition) => {
                    const node = this.nodeFactory.createDelayNode(this, delay.identifier, delay.date)
                    this.delays.set(delay.identifier, node)
                })
            })
        }).then(() => {
            return Promise.all(Array.from(this.tasks.values(), (node: ITaskNode) => {
                return this.modifierDao.getTaskModifiers(this.projectIdentifier, node.taskIdentifier)
                    .then((modifiers: Array<Modifier>) => {
                        node.modifiers = modifiers
                    })
            }))
        }).then(() => {
            return Promise.all(Array.from(this.tasks.values(), (node: ITaskNode) => {
                return this.taskRelationDao.getTaskRelations(this.projectIdentifier, node.taskIdentifier)
                    .then((taskRelations: Array<TaskRelation>) => {
                        taskRelations.forEach((taskRelation: TaskRelation) => {
                            const child = mapGet(this.tasks, taskRelation.next) as ITaskNodeImpl
                            let taskNode = node as ITaskNodeImpl
                            return taskNode.addChild(child, taskRelation)
                        })
                    })
            }))
        }).then(() => {
            return Promise.all(Array.from(this.delays.values(), (node: IDelayNode) => {
                return this.delayRelationDao.getDelayRelations(this.projectIdentifier, node.delayIdentifier)
                    .then((delayRelations: Array<DelayRelation>) => {
                        delayRelations.forEach((delayRelation: DelayRelation) => {
                            const task = mapGet(this.tasks, delayRelation.task) as ITaskNodeImpl
                            let delayNode = node as IDelayNodeImpl
                            task.addDelay(delayNode, delayRelation)
                        })
                    })
            }))
        }).then(() => {
            const message = `Graph loaded for project "${this.projectIdentifier}", `
                + `tasks: ${this.tasks.size}, `
                + `delays: ${this.delays.size}`
            winston.info(message)

            return Promise.all(Array.from(this.tasks.values(), (node: ITaskNode) => {
                return (node as ITaskNodeImpl).compute()
            }))
        }).then(() => {
            winston.info(`Graph computed for project "${this.projectIdentifier}"`)
        })
    }
    addTask(task: TaskDefinition): Promise<ITaskNode> {
        if (this.tasks.has(task.identifier)) {
            return Promise.reject(new ExistsError(`Task "${task.identifier}" is already present in project`))
        }
        return this.taskDao.addTask(this.projectIdentifier, task).then(() => {
            const node = this.nodeFactory.createTaskNode(this.daoBuilder, this, task.identifier,
                task.estimatedStartDate, task.estimatedDuration)
            this.tasks.set(task.identifier, node)
            return node
        })
    }
    addDelay(delay: DelayDefinition): Promise<IDelayNode> {
        if (this.delays.has(delay.identifier)) {
            return Promise.reject(new ExistsError(`Delay "${delay.identifier}" is already present in project`))
        }
        return this.delayDao.addDelay(this.projectIdentifier, delay).then(() => {
            const node = this.nodeFactory.createDelayNode(this, delay.identifier, delay.date)
            this.delays.set(delay.identifier, node)
            return node
        })
    }
    addTaskRelation(relation: TaskRelation): Promise<void> {
        if (!this.tasks.has(relation.previous)) {
            return Promise.reject(new NotFoundError(`Task "${relation.previous}" is not present in project`))
        }
        if (!this.tasks.has(relation.next)) {
            return Promise.reject(new NotFoundError(`Task "${relation.next}" is not present in project`))
        }

        return this.taskRelationDao.addTaskRelation(this.projectIdentifier, relation).then(() => {
            const child = mapGet(this.tasks, relation.next) as ITaskNodeImpl
            let taskNode = mapGet(this.tasks, relation.previous) as ITaskNodeImpl
            return taskNode.addChild(child, relation)
        })
    }
    addDelayRelation(relation: DelayRelation): Promise<void> {
        if (!this.tasks.has(relation.task)) {
            return Promise.reject(new NotFoundError(`Task "${relation.task}" is not present in project`))
        }
        if (!this.delays.has(relation.delay)) {
            return Promise.reject(new NotFoundError(`Delay ${relation.delay}" is not present in project`))
        }

        return this.delayRelationDao.addDelayRelation(this.projectIdentifier, relation).then(() => {
            const delay = mapGet(this.delays, relation.delay) as IDelayNodeImpl
            let taskNode = mapGet(this.tasks, relation.task) as ITaskNodeImpl
            return taskNode.addDelay(delay, relation)
        })
    }
}
