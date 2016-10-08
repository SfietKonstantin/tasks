import * as express from "express"
import { Project, Task, TaskResults, Impact } from "../core/types"
import * as apitypes from "../core/apitypes"
import { IDataProvider, NotFoundError } from "../core/data/idataprovider"
import { TaskNode } from "../core/graph/types"
import { compute, GraphPersistence } from "../core/graph/graph"

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
        const id = +String(req.params.id)
        this.dataProvider.getProject(id).then((project: Project) => {
            return this.dataProvider.getProjectTasks(id).then((tasks: Array<Task>) => {
                tasks.filter((value: Task) => { return !!value })
                return this.dataProvider.getTasksResults(tasks.map((task: Task) => { return task.id })).then((tasksResults: Array<TaskResults>) => {
                    res.json(apitypes.createApiProjectAndTasks(project, tasks, tasksResults))
                })
            })
        }).catch((error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getTask(req: express.Request, res: express.Response) {
        const id = +String(req.params.id)
        this.sendTask(id, res).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    isTaskImportant(req: express.Request, res: express.Response) {
        const id = +String(req.params.id)
        this.dataProvider.isTaskImportant(id).then((result: boolean) => {
            res.json({important: result})
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    putTaskImportant(req: express.Request, res: express.Response) {
       this.setTaskImportant(req, res, true) 
    }
    deleteTaskImportant(req: express.Request, res: express.Response) {
       this.setTaskImportant(req, res, false) 
    }
    postImpact(req: express.Request, res: express.Response) {
        const impact = JSON.parse(req.body.impact) as Impact
        const taskId = +Number(req.body.task)

        let graph: GraphPersistence = new GraphPersistence(this.dataProvider)
        this.dataProvider.hasTask(taskId).then(() => {
            return this.dataProvider.addImpact(impact)
        }).then((id: number) => {
            return this.dataProvider.setImpactForTask(id, taskId)
        }).then(() => {
            return graph.loadGraph(taskId)
        }).then(() => {
            return graph.loadData()
        }).then(() => {
            compute(graph.root)
            return graph.save()
        }).then(() => {
            return this.sendTask(taskId, res)
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    private setTaskImportant(req: express.Request, res: express.Response, important: boolean) {
        const id = +String(req.params.id)
        this.dataProvider.setTaskImportant(id, important).then(() => {
            res.json({important: important})
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    private sendTask(id: number, res: express.Response) : Promise<void> {
        return this.dataProvider.getTask(id).then((task: Task) => {
            return this.dataProvider.getProject(task.projectId).then((project: Project) => {
                return this.dataProvider.getTaskResults(task.id).then((taskResults: TaskResults) => {
                    return this.dataProvider.getTaskImpactIds(id).then((ids: Array<number>) => {
                        return this.dataProvider.getImpacts(ids).then((impacts: Array<Impact>) => {
                            const apiTask: apitypes.ApiProjectTaskImpacts = {
                                project: project,
                                task: apitypes.createApiTask(task, taskResults),
                                impacts: impacts
                            }
                            res.json(apiTask)
                        })
                    })
                })
            })
        })
    }
}