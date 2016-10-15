import * as express from "express"
import { Api, RequestError } from "../core/api"
import { Project, Modifier } from "../../common/types"
import { ApiTask, ApiProjectTaskModifiers } from "../../common/apitypes"
import { IDataProvider } from "../core/data/idataprovider"
import { IGraph } from "../core/graph/types"
import * as testdata from "../core/tests/testdata"

export class ApiRoutes {
    private dataProvider: IDataProvider
    private graph: IGraph
    private api: Api
    constructor(dataProvider: IDataProvider, graph: IGraph, api: Api) {
        this.dataProvider = dataProvider
        this.graph = graph
        this.api = api
    }
    getProjects(req: express.Request, res: express.Response) {
        this.api.getProjects().then((projects: Array<Project>) => {
            res.json({projects: projects})
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    getProject(req: express.Request, res: express.Response) {
        this.api.getProject(req.params.projectIdentifier).then((project: Project) => {
            res.json(project)
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    getProjectTasks(req: express.Request, res: express.Response) {
        this.api.getProjectTasks(req.params.projectIdentifier).then((tasks: Array<ApiTask>) => {
            res.json(tasks)
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    getTask(req: express.Request, res: express.Response) {
        const projectIdentifier = req.params.projectIdentifier
        const taskIdentifier = req.params.taskIdentifier
        this.api.getTask(projectIdentifier, taskIdentifier).then((task: ApiProjectTaskModifiers) => {
            res.json(task)
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    isTaskImportant(req: express.Request, res: express.Response) {
        const projectIdentifier = req.params.projectIdentifier
        const taskIdentifier = req.params.taskIdentifier
        this.api.isTaskImportant(projectIdentifier, taskIdentifier).then((important: boolean) => {
            res.json({important})
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    putTaskImportant(req: express.Request, res: express.Response) {
        const projectIdentifier = req.params.projectIdentifier
        const taskIdentifier = req.params.taskIdentifier
        this.api.setTaskImportant(projectIdentifier, taskIdentifier, true).then((important: boolean) => {
            res.json({important})
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    deleteTaskImportant(req: express.Request, res: express.Response) {
        const projectIdentifier = req.params.projectIdentifier
        const taskIdentifier = req.params.taskIdentifier
        this.api.setTaskImportant(projectIdentifier, taskIdentifier, false).then((important: boolean) => {
            res.json({important})
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    putModifier(req: express.Request, res: express.Response) {
        const modifier = req.body.modifier
        const taskIdentifier = req.body.taskIdentifier
        this.api.addModifier(modifier, taskIdentifier).then((task: ApiProjectTaskModifiers) => {
            res.json(task)
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    putImport(req: express.Request, res: express.Response) {
        const project = req.body.project
        const tasks = req.body.tasks
        this.api.import(project, tasks).then(() => {
            res.sendStatus(301)
        }).catch((error: RequestError) => {
            res.status(error.status).json(error.json)
        })
    }
    getDemoData(req: express.Request, res: express.Response) {
        testdata.fillTestData(this.dataProvider, this.graph).then(() => {
            res.sendStatus(200)
        }).catch((error) => {
            res.sendStatus(500)
        })
    }
}
