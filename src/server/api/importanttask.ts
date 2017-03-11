import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {RequestError} from "../error/request"
import {NotFoundError} from "../../common/errors/notfound"
import {ApiErrorUtils} from "./error/utils"

export class ImportantTaskApiProvider {
    private readonly daoBuilder: IDaoBuilder
    private readonly graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        const taskDao = this.daoBuilder.buildTaskDao()
        return taskDao.isTaskImportant(projectIdentifier, taskIdentifier).catch((error: Error) => {
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

    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<boolean> {
        const taskDao = this.daoBuilder.buildTaskDao()
        return taskDao.setTaskImportant(projectIdentifier, taskIdentifier, important).then(() => {
            return important
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
}
