import {Router, Request, Response, NextFunction} from "express"
import {IDaoBuilder} from "../../dao/ibuilder"
import {ProjectApiProvider} from "../../api/project"
import {IGraph} from "../../graph/igraph"
import {asRoute, asParameterHandler} from "./utils"
import {TaskApiProvider} from "../../api/task"

interface ProjectRequest extends Request {
    projectIdentifier: string
}

interface TaskRequest extends ProjectRequest {
    taskIdentifier: string
}

export class ApiRouterFactory {
    private projectApiProvider: ProjectApiProvider
    private taskApiProvider: TaskApiProvider

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.projectApiProvider = new ProjectApiProvider(daoBuilder, graph)
        this.taskApiProvider = new TaskApiProvider(daoBuilder, graph)
    }

    create(): Router {
        const apiRouter = Router()
        apiRouter.param("projectIdentifier", asParameterHandler((req: ProjectRequest) => {
            req.projectIdentifier = ProjectApiProvider.getProjectIdentifier(req.params.projectIdentifier)
        }))
        apiRouter.param("taskIdentifier", asParameterHandler((req: TaskRequest) => {
            req.taskIdentifier = TaskApiProvider.getTaskIdentifier(req.params.taskIdentifier)
        }))

        apiRouter.get("/project/list", asRoute(() => {
            return this.projectApiProvider.getProjects()
        }))

        apiRouter.get("/project/:projectIdentifier", asRoute((req: ProjectRequest) => {
            return this.projectApiProvider.getProject(req.projectIdentifier)
        }))

        apiRouter.get("/project/:projectIdentifier/task/list", asRoute((req: ProjectRequest) => {
            return this.taskApiProvider.getProjectTasks(req.projectIdentifier)
        }))

        apiRouter.get("/project/:projectIdentifier/task/:taskIdentifier", asRoute((req: TaskRequest) => {
            return this.taskApiProvider.getTask(req.projectIdentifier, req.taskIdentifier)
        }))
        return apiRouter
    }
}
