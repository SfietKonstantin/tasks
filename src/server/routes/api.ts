import * as express from "express"
import { Project, Task, TaskResults, Modifier } from "../../common/types"
import * as apitypes from "../../common//apitypes"
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
            res.json(project)
        }).catch((error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getProjectTasks(req: express.Request, res: express.Response) {
        const identifier = String(req.params.identifier)
        this.dataProvider.getProjectTasks(identifier).then((tasks: Array<Task>) => {
            tasks.filter((value: Task) => { return !!value })
            return this.dataProvider.getTasksResults(tasks.map((task: Task) => { return task.identifier })).then((tasksResults: Array<TaskResults>) => {
                res.json(apitypes.createApiTasks(tasks, tasksResults))
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
    postModifier(req: express.Request, res: express.Response) {
        const modifier = req.body.modifier as Modifier
        const taskIdentifier = String(req.body.identifier)

        let graph: GraphPersistence = new GraphPersistence(this.dataProvider)
        this.dataProvider.hasTask(taskIdentifier).then(() => {
            return this.dataProvider.addModifier(modifier)
        }).then((id: number) => {
            return this.dataProvider.setModifierForTask(id, taskIdentifier)
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
                    return this.dataProvider.getTaskModifierIds(identifier).then((ids: Array<number>) => {
                        return this.dataProvider.getModifiers(ids).then((modifiers: Array<Modifier>) => {
                            const apiTask: apitypes.ApiProjectTaskModifiers = {
                                project: project,
                                task: apitypes.createApiTask(task, taskResults),
                                modifiers: modifiers
                            }
                            res.json(apiTask)
                        })
                    })
                })
            })
        })
    }
}