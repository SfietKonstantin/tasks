import * as express from "express"
import { Task, Project } from "../core/types"
import { IDataProvider, NotFoundError } from "../core/data/idataprovider"
import { TaskNode } from "../core/graph/types"

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
    getProjects(req: express.Request, res: express.Response) {
        this.dataProvider.getAllProjects().then((projects: Array<Project>) => {
            res.json({projects: projects})
        }).catch((error) => {
            res.status(500).json(error)
        })
    }
    getProject(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        this.dataProvider.getProject(id).then((project: Project) => {
            res.json({projects: project})
        }).catch((error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getProjectTasks(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        this.dataProvider.getProjectTasks(id).then((tasks: Array<Task>) => {
            return this.dataProvider.getProject(id).then((project: Project) => {
                tasks.filter((value: Task) => { return !!value })
                res.json({project: project, tasks: tasks})
            })
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getTask(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        let task = this.dataProvider.getTask(id).then((task: Task) => {
            return this.dataProvider.getProject(task.projectId).then((project: Project) => {
                res.json({project: project, task: task})
            })
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
}