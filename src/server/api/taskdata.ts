import * as winston from "winston"
import {Project} from "../../common/project"
import {ApiTask, TaskBuilder} from "../../common/api/task"
import {Modifier} from "../../common/modifier"
import {ApiDelayDefinition, DelayBuilder} from "../../common/api/delay"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {TaskDefinition} from "../../common/task"
import {get as mapGet} from "../../common/utils/map"
import {IDelayNode} from "../graph/idelaynode"
import {ITaskNode} from "../graph/itasknode"
import {DelayDefinition} from "../../common/delay"
import {NotFoundError} from "../../common/errors/notfound"
import {RequestError} from "../error/requesterror"
import {ApiErrorUtils} from "./error/utils"

export interface ApiTaskData {
    project: Project
    task: ApiTask
    modifiers: Array<Modifier>
    delays: Array<ApiDelayDefinition>
}

export class ApiTaskDataBuilder {
    private daoBuilder: IDaoBuilder
    private graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    build(projectIdentifier: string, taskIdentifier: string): Promise<ApiTaskData> {
        const taskDao = this.daoBuilder.buildTaskDao()
        return taskDao.getTask(projectIdentifier, taskIdentifier).then((task: TaskDefinition) => {
            const projectDao = this.daoBuilder.buildProjectDao()
            return projectDao.getProject(projectIdentifier).then((project: Project) => {
                const projectNode = mapGet(this.graph.projects, projectIdentifier)
                let taskNode = mapGet(projectNode.tasks, taskIdentifier)
                let delays = new Set<IDelayNode>()
                ApiTaskDataBuilder.collectDelays(taskNode, delays)

                return Promise.all(Array.from(delays, (node: IDelayNode) => {
                    const delayDao = this.daoBuilder.buildDelayDao()
                    return delayDao.getDelay(projectIdentifier, node.delayIdentifier)
                })).then((delays: Array<DelayDefinition>): ApiTaskData => {
                    const apiDelays = delays.map((delay: DelayDefinition) => {
                        const node = mapGet(projectNode.delays, delay.identifier)
                        return DelayBuilder.toApiDelay(delay, node.initialMargin, node.margin)
                    })
                    return {
                        project: project,
                        task: TaskBuilder.toApiTask(task, taskNode.startDate, taskNode.duration),
                        modifiers: taskNode.modifiers,
                        delays: apiDelays
                    }
                })
            })
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                winston.debug(error.message)
                throw new RequestError(404, `Task "${taskIdentifier}" not found`)
            } else if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }

    private static collectDelays(taskNode: ITaskNode, delays: Set<IDelayNode>) {
        taskNode.delays.forEach((delay: IDelayNode) => {
            delays.add(delay)
        })

        taskNode.children.forEach((child: ITaskNode) => {
            ApiTaskDataBuilder.collectDelays(child, delays)
        })
    }
}
