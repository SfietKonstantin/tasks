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
        const identifier = String(req.params.identifier)
        this.dataProvider.getProject(identifier).then((project: Project) => {
            return this.dataProvider.getProjectTasks(identifier).then((tasks: Array<Task>) => {
                tasks.filter((value: Task) => { return !!value })
                return this.dataProvider.getTasksResults(tasks.map((task: Task) => { return task.identifier })).then((tasksResults: Array<TaskResults>) => {
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
        const identifier = String(req.params.identifier)
        this.sendTask(identifier, res).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    isTaskImportant(req: express.Request, res: express.Response) {
        const identifier = String(req.params.identifier)
        this.dataProvider.isTaskImportant(identifier).then((result: boolean) => {
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
        const taskIdentifier = String(req.body.task)

        let graph: GraphPersistence = new GraphPersistence(this.dataProvider)
        this.dataProvider.hasTask(taskIdentifier).then(() => {
            return this.dataProvider.addImpact(impact)
        }).then((id: number) => {
            return this.dataProvider.setImpactForTask(id, taskIdentifier)
        }).then(() => {
            return graph.loadGraph(taskIdentifier)
        }).then(() => {
            return graph.loadData()
        }).then(() => {
            compute(graph.root)
            return graph.save()
        }).then(() => {
            return this.sendTask(taskIdentifier, res)
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    private setTaskImportant(req: express.Request, res: express.Response, important: boolean) {
        const identifier = String(req.params.identifier)
        this.dataProvider.setTaskImportant(identifier, important).then(() => {
            res.json({important: important})
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    private sendTask(identifier: string, res: express.Response) : Promise<void> {
        return this.dataProvider.getTask(identifier).then((task: Task) => {
            return this.dataProvider.getProject(task.projectIdentifier).then((project: Project) => {
                return this.dataProvider.getTaskResults(task.identifier).then((taskResults: TaskResults) => {
                    return this.dataProvider.getTaskImpactIds(identifier).then((ids: Array<number>) => {
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