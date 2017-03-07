import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {Project} from "../../common/project"
import {NotFoundError} from "../../common/errors/notfound"
import {RequestError} from "../error/requesterror"
import {ApiErrorUtils} from "./error/utils"

export class ProjectApiProvider {
    private daoBuilder: IDaoBuilder
    private graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    getProjects(): Promise<Array<Project>> {
        const projectDao = this.daoBuilder.buildProjectDao()
        return projectDao.getAllProjects().catch((error: Error) => {
            winston.error(error.message)
            if (ApiErrorUtils.isKnownError(error)) {
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }

    getProject(projectIdentifier: string): Promise<Project> {
        const projectDao = this.daoBuilder.buildProjectDao()
        return projectDao.getProject(projectIdentifier).catch((error: Error) => {
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
}
