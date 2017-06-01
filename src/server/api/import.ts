import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {IGraph} from "../graph/igraph"
import {RequestError} from "../error/request"
import {NotFoundError} from "../../common/errors/notfound"
import {ApiErrorUtils} from "./error/utils"
import {InputError} from "../../common/errors/input"
import {ExistsError} from "../error/exists"
import {IProjectNode} from "../graph/iprojectnode"
import {TaskDefinition} from "../../common/old/task"
import {TaskRelation} from "../../common/old/taskrelation"
import {DelayDefinition} from "../../common/old/delay"
import {DelayRelation} from "../../common/old/delayrelation"
import {ProjectBuilder} from "../../common/api/project"
import {TaskBuilder} from "../../common/api/task"
import {TaskRelationBuilder} from "../../common/api/taskrelation"
import {DelayBuilder} from "../../common/api/delay"
import {DelayRelationBuilder} from "../../common/api/delayrelation"
import {findCyclicDependency} from "../graph/analyzer"

export class ImportApiProvider {
    private readonly daoBuilder: IDaoBuilder
    private readonly graph: IGraph

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.daoBuilder = daoBuilder
        this.graph = graph
    }

    import(project: any, tasks: any, taskRelations: any, delays: any, delayRelations: any): Promise<void> {
        return Promise.resolve().then(() => {
            const inputProject = ProjectBuilder.fromObject(project)
            if (!(tasks instanceof Array)) {
                throw new InputError(`tasks must be an array, not ${tasks}`)
            }
            const inputTasks = tasks.map((task) => {
                return TaskBuilder.fromObject(task)
            })
            if (!(taskRelations instanceof Array)) {
                throw new InputError(`taskRelations must be an array, not ${taskRelations}`)
            }
            const inputTaskRelations = taskRelations.map((relation) => {
                return TaskRelationBuilder.fromObject(relation)
            })
            if (!(delays instanceof Array)) {
                throw new InputError(`delays must be an array, not ${delays}`)
            }
            const inputDelays = delays.map((delays) => {
                return DelayBuilder.fromObject(delays)
            })
            if (!(delayRelations instanceof Array)) {
                throw new InputError(`delayRelations must be an array, not ${delayRelations}`)
            }
            const inputDelayRelations = delayRelations.map((relation) => {
                return DelayRelationBuilder.fromObject(relation)
            })

            findCyclicDependency(inputTasks, inputTaskRelations)

            return this.graph.addProject(inputProject).then((projectNode: IProjectNode) => {
                return Promise.all(inputTasks.map((task: TaskDefinition) => {
                    return projectNode.addTask(task)
                })).then(() => {
                    return Promise.all(inputTaskRelations.map((relation: TaskRelation) => {
                        return projectNode.addTaskRelation(relation)
                    }))
                }).then(() => {
                    return Promise.all(inputDelays.map((delay: DelayDefinition) => {
                        return projectNode.addDelay(delay)
                    }))
                }).then(() => {
                    return Promise.all(inputDelayRelations.map((relation: DelayRelation) => {
                        return projectNode.addDelayRelation(relation)
                    }))
                })
            }).then(() => {})
        }).catch((error: Error) => {
            if (error instanceof InputError || error instanceof ExistsError) {
                winston.debug(error.message)
                throw new RequestError(400, "Invalid input for import")
            } else if (error instanceof NotFoundError) {
                winston.debug(error.message)
                throw new RequestError(404, "Invalid input for import")
            } else if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }
}
