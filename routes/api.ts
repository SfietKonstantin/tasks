import * as express from "express"
import { IDataProvider } from "../idataprovider"

class RequestError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export class Api {
    private dataProvider : IDataProvider
    constructor(dataProvider: IDataProvider)
    {
        this.dataProvider = dataProvider
    }
    getProjectList(req: express.Request, res: express.Response) {
        let projects = this.dataProvider.getProjectList()
        res.json({projects: projects})
    }
    getProject(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        let project = this.dataProvider.getProject(id)
        if (project == null) {
            let error = new RequestError("This project do not exists")
            res.status(404).json(error)
        } else {
            res.json({project: project})
        }
    }
    getProjectTaskList(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        let project = this.dataProvider.getProject(id)
        if (project == null) {
            let error = new RequestError("This project do not exists")
            res.status(404).json(error)
        } else {
            let tasks = this.dataProvider.getProjectTaskList(id)
            res.json({project: project, tasks: tasks})
        }
    }
    getTask(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        let node = this.dataProvider.getNode(id)
        if (node == null) {
            let error = new RequestError("This task do not exists")
            res.status(404).json(error)
        } else {
            let project = this.dataProvider.getProject(node.task.projectId)
            if (project == null) {
                let error = new RequestError("This task is not attached to an existing project")
                res.status(500).json(error)
            } else {
                res.json({project: project, task: node})
            }
        }
    }
}