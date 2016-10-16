import * as express from "express"
import { Project, Task, TaskResults, Modifier } from "../../common/types"
import * as apitypes from "../../common//apitypes"
import { IDataProvider, NotFoundError, ExistsError } from "../core/data/idataprovider"
import { IGraph, IProjectNode, ITaskNode, GraphError } from "../core/graph/types"
import * as testdata from "../core/testdata"
import * as maputils from "../../common/maputils"

class RequestError {
    message: string
    constructor(message: string) {
        this.message = message
    }
}

export class Api {
    private dataProvider: IDataProvider
    private graph: IGraph
    constructor(dataProvider: IDataProvider, graph: IGraph) {
        this.dataProvider = dataProvider
        this.graph = graph
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
        this.graph.addProject(project).then(() => {
            res.sendStatus(301)
        }).catch((error: Error) => {
            if (error instanceof GraphError) {
                res.status(400).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getProject(req: express.Request, res: express.Response) {
        const projectIdentifier = String(req.params.projectIdentifier)
        this.dataProvider.getProject(projectIdentifier).then((project: Project) => {
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
        const projectIdentifier = String(req.params.projectIdentifier)
        this.dataProvider.getProjectTasks(projectIdentifier).then((tasks: Array<Task>) => {
            tasks.filter((value: Task) => { return !!value })
            Promise.all(tasks.map((task: Task) => {
                return this.dataProvider.getTaskResults(task.projectIdentifier, task.identifier)
            })).then((tasksResults: Array<TaskResults>) => {
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
    putTask(req: express.Request, res: express.Response) {
        const apiTask = req.body.task as apitypes.ApiInputTask
        const task = apitypes.createTaskFromApiImportTask(apiTask)
        maputils.get(this.graph.nodes, task.projectIdentifier).addTask(task).then(() => {
            res.sendStatus(301)
        }).catch((error: Error) => {
            if (error instanceof GraphError) {
                res.status(400).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getTask(req: express.Request, res: express.Response) {
        const projectIdentifier = String(req.params.projectIdentifier)
        const taskIdentifier = String(req.params.taskIdentifier)
        this.sendTask(projectIdentifier, taskIdentifier, res).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    isTaskImportant(req: express.Request, res: express.Response) {
        const projectIdentifier = String(req.params.projectIdentifier)
        const taskIdentifier = String(req.params.taskIdentifier)
        this.dataProvider.isTaskImportant(projectIdentifier, taskIdentifier).then((result: boolean) => {
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
        const taskIdentifier = String(req.body.taskIdentifier)

        const projectNode = maputils.get(this.graph.nodes, modifier.projectIdentifier)
        let taskNode = maputils.get(projectNode.nodes, taskIdentifier)
        taskNode.addModifier(modifier).then(() => {
            return this.sendTask(modifier.projectIdentifier, taskIdentifier, res)
        }).catch((error: Error) => {
            if (error instanceof GraphError) {
                res.status(400).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    getDemoData(req: express.Request, res: express.Response) {
        testdata.fillTestData(this.dataProvider, this.graph)
        res.sendStatus(200)
    }
    private setTaskImportant(req: express.Request, res: express.Response, important: boolean) {
        const projectIdentifier = String(req.params.projectIdentifier)
        const taskIdentifier = String(req.params.taskIdentifier)
        this.dataProvider.setTaskImportant(projectIdentifier, taskIdentifier, important).then(() => {
            res.json({important: important})
        }).catch((error: Error) => {
            if (error instanceof NotFoundError) {
                res.status(404).json(error)
            } else {
                res.status(500).json(error)
            }
        })
    }
    private sendTask(projectIdentifier: string, taskIdentifier: string, res: express.Response): Promise<void> {
        return this.dataProvider.getTask(projectIdentifier, taskIdentifier).then((task: Task) => {
            return this.dataProvider.getProject(task.projectIdentifier).then((project: Project) => {
                const projectNode = maputils.get(this.graph.nodes, projectIdentifier)
                let taskNode = maputils.get(projectNode.nodes, taskIdentifier)

                const apiTask: apitypes.ApiProjectTaskModifiers = {
                    project: project,
                    task: apitypes.createApiTask(task, {
                        projectIdentifier,
                        taskIdentifier,
                        startDate: taskNode.startDate,
                        duration: taskNode.duration
                    }),
                    modifiers: taskNode.modifiers
                }
                res.json(apiTask)
            })
        })
    }
}
