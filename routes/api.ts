import * as express from "express"
import { Task, Project } from "../core/types"
import { IDataProvider, FieldNotFoundError } from "../core/data/idataprovider"
import { TaskNode } from "../core/graph/graph"

class RequestError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

class ApiTask extends Task {
    start_date: Date
    duration: number
    constructor(node: TaskNode) {
        super(node.task.id, node.task.projectId)
        this.name = node.task.name
        this.description = node.task.description
        this.estimatedStartDate = node.task.estimatedStartDate
        this.estimatedDuration = node.task.estimatedDuration
        this.start_date = node.start_date
        this.duration = node.duration
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
            if (error instanceof FieldNotFoundError) {
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
            if (error instanceof FieldNotFoundError) {
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
            if (error instanceof FieldNotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
}