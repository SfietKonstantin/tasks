import * as express from "express"
import { Project, Task, TaskResults, Modifier } from "../../common/types"
import * as apitypes from "../../common//apitypes"
import { IDataProvider, NotFoundError, ExistsError } from "../core/data/idataprovider"
import { TaskNode } from "../core/graph/types"
import { compute, GraphPersistence } from "../core/graph/graph"
import * as testdata from "../core/testdata"

class RequestError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export class Api {
    private dataProvider: IDataProvider
    constructor(dataProvider: IDataProvider) {
        this.dataProvider = dataProvider
    }
    getProjects(req: express.Request, res: express.Response) {
        this.dataProvider.getAllProjects().then((projects: Array<Project>) => {
            res.json({projects: projects})
        }).catch((error) => {
            res.status(500).json(error)
        })
    }
    putProject(req: express.Request, res: express.Response) {
        const project = req.body.project as Project

        this.dataProvider.addProject(project).then(() => {
            res.sendStatus(301)
        }).catch((error: Error) => {
            if (error instanceof ExistsError) {
                res.status(400).json(error)
            } else {
                res.status(500).json(error)
            }
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
            return this.dataProvider.getTasksResults(tasks.map((task: Task) => {
                return task.identifier
            })).then((tasksResults: Array<TaskResults>) => {
                res.json(apitypes.createApiTasks(tasks, tasksResults))
            })
        }).catch((error) => {
            console.log(error)
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    putTask(req: express.Request, res: express.Response) {
        const apiTask = req.body.task as apitypes.ApiInputTask
        const task = apitypes.createTaskFromApiImportTask(apiTask)
        this.dataProvider.addTask(task).then(() => {
            return this.dataProvider.setTasksResults([{
                taskIdentifier: task.identifier,
                startDate: task.estimatedStartDate,
                duration: task.estimatedDuration
            }])
        }).then(() => {
            res.sendStatus(301)
        }).catch((error: Error) => {
            console.log(error)
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else if (error instanceof ExistsError) {
                res.status(400).json(error)
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
    putModifier(req: express.Request, res: express.Response) {
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
    getDemoData(req: express.Request, res: express.Response) {
        testdata.fillTestData(this.dataProvider)
        res.sendStatus(200)
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
    private sendTask(identifier: string, res: express.Response): Promise<void> {
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
