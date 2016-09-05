import * as express from "express"
import { IDataProvider } from "../idataprovider"

class RequestError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export class Api {
    constructor(dataProvider: IDataProvider)
    {
        this.dataProvider = dataProvider
    }
    getProjectList(req: express.Request, res: express.Response) {
        let projects = this.dataProvider.getProjectList()
        res.json({projects: projects})
    }
    getProject(req: express.Request, res: express.Response) {
        let id: number = req.params.id
        let project = this.dataProvider.getProject(id)
        if (project == null) {
            let error = new RequestError("This project do not exists")
            res.status(404).json(error)
        } else {
            res.json({project: project})
        }
    }
    getProjectTaskList(req: express.Request, res: express.Response) {
        let id: number = req.params.id
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
        let id: number = req.params.id
        let task = this.dataProvider.getTask(id)
        if (task == null) {
            let error = new RequestError("This task do not exists")
            res.status(404).json(error)
        } else {
            let project = this.dataProvider.getProject(task.project_id)
            if (project == null) {
                let error = new RequestError("This task is not attached to an existing project")
                res.status(500).json(error)
            } else {
                res.json({project: project, task: task})
            }
        }
    }
    private dataProvider : IDataProvider
}