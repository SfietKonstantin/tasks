import {Router, Request} from "express"
import {IDaoBuilder} from "../dao/ibuilder"
import {ProjectApiProvider} from "../api/project"
import {IGraph} from "../graph/igraph"
import {
    asRoute, asParameterHandler, ProjectRequest, TaskRequest, getProjectIdentifier,
    getTaskIdentifier
} from "./utils"
import {TaskApiProvider} from "../api/task"
import {ImportantTaskApiProvider} from "../api/importanttask"
import {ModifierApiProvider} from "../api/modifier"
import {ModifierBuilder} from "../../common/api/modifier"

export class ApiRouterFactory {
    private readonly projectApiProvider: ProjectApiProvider
    private readonly taskApiProvider: TaskApiProvider
    private readonly importantTaskApiProvider: ImportantTaskApiProvider
    private readonly modifierApiProvider: ModifierApiProvider

    constructor(daoBuilder: IDaoBuilder, graph: IGraph) {
        this.projectApiProvider = new ProjectApiProvider(daoBuilder, graph)
        this.taskApiProvider = new TaskApiProvider(daoBuilder, graph)
        this.importantTaskApiProvider = new ImportantTaskApiProvider(daoBuilder, graph)
        this.modifierApiProvider = new ModifierApiProvider(daoBuilder, graph)
    }

    create(): Router {
        const apiRouter = Router()
        apiRouter.param("projectIdentifier", asParameterHandler((req: ProjectRequest) => {
            req.projectIdentifier = getProjectIdentifier(req.params.projectIdentifier)
        }))
        apiRouter.param("taskIdentifier", asParameterHandler((req: TaskRequest) => {
            req.taskIdentifier = getTaskIdentifier(req.params.taskIdentifier)
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

        const importantTaskPath = "/project/:projectIdentifier/task/:taskIdentifier/important"
        apiRouter.get(importantTaskPath, asRoute((req: TaskRequest) => {
            return this.importantTaskApiProvider.isTaskImportant(req.projectIdentifier, req.taskIdentifier)
        }))

        apiRouter.put(importantTaskPath, asRoute((req: TaskRequest) => {
            return this.importantTaskApiProvider.setTaskImportant(req.projectIdentifier, req.taskIdentifier, true)
        }))

        apiRouter.delete(importantTaskPath, asRoute((req: TaskRequest) => {
            return this.importantTaskApiProvider.setTaskImportant(req.projectIdentifier, req.taskIdentifier, false)
        }))

        apiRouter.put("/modifier", asRoute((req: Request) => {
            const projectIdentifier = getProjectIdentifier(req.body.projectIdentifier)
            const taskIdentifier = getTaskIdentifier(req.body.taskIdentifier)
            const modifier = ModifierBuilder.fromObject(req.body.modifier)
            return this.modifierApiProvider.addModifier(projectIdentifier, taskIdentifier, modifier)
        }))
        return apiRouter
    }
}
