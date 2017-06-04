import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {RequestError} from "../../error/request"
import {get as mapGet} from "../../../common/utils/map"
import {TaskDefinition} from "../../../common/old/task"
import {TaskBuilder, ApiTask} from "../../../common/old/api/task"
import {NotFoundError} from "../../../common/errors/notfound"
import {ApiErrorUtils} from "../../api/error/utils"
import {ApiTaskData, ApiTaskDataBuilder} from "./taskdata"

export class TaskApiProvider {
    private readonly daoBuilder: IDaoBuilder
    private readonly graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    getProjectTasks(projectIdentifier: string): Promise<Array<ApiTask>> {
        const taskDao = this.daoBuilder.buildTaskDao()
        return taskDao.getProjectTasks(projectIdentifier).then((tasks: Array<TaskDefinition>) => {
            const projectNode = mapGet(this.graph.projects, projectIdentifier)
            return tasks.map((task: TaskDefinition) => {
                const taskNode = mapGet(projectNode.tasks, task.identifier)
                return TaskBuilder.toApiTask(task, taskNode.startDate, taskNode.duration)
            })
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                winston.debug(error.message)
                throw new RequestError(404, `Project "${projectIdentifier}" not found`)
            } else if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }

    getTask(projectIdentifier: string, taskIdentifier: string): Promise<ApiTaskData> {
        return new ApiTaskDataBuilder(this.daoBuilder, this.graph).build(projectIdentifier, taskIdentifier)
    }
}
