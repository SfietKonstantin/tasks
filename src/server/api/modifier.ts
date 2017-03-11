import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {RequestError} from "../error/request"
import {NotFoundError} from "../../common/errors/notfound"
import {ApiTaskDataBuilder, ApiTaskData} from "./taskdata"
import {get as mapGet} from "../../common/utils/map"
import {ApiErrorUtils} from "./error/utils"

export class ModifierApiProvider {
    private readonly daoBuilder: IDaoBuilder
    private readonly graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    addModifier(projectIdentifier: string, taskIdentifier: string, modifier: any): Promise<ApiTaskData> {
        const projectNode = mapGet(this.graph.projects, projectIdentifier)
        let taskNode = mapGet(projectNode.tasks, taskIdentifier)
        return taskNode.addModifier(modifier).catch((error) => {
            if (error instanceof NotFoundError) {
                winston.debug(error.message)
                throw new RequestError(404, `Task "${taskIdentifier}" not found`)
            } else if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        }).then(() => {
            return new ApiTaskDataBuilder(this.daoBuilder, this.graph).build(projectIdentifier, taskIdentifier)
        })
    }
}
