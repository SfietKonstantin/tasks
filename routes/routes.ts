import * as express from "express"
import { Project, Task } from "../core/types"
import { IDataProvider } from "../core/data/idataprovider"

export class Routes {
    private dataProvider : IDataProvider
    constructor(dataProvider: IDataProvider)
    {
        this.dataProvider = dataProvider
    }
    index(req: express.Request, res: express.Response) {
        res.render('index');
    }
    getTask(req: express.Request, res: express.Response) {
        let id: number = Number(req.params.id)
        this.dataProvider.getTask(id).then((task: Task) => {
            return this.dataProvider.getProject(task.projectId).then((project: Project) => {
                res.render('task', {project: project, task: task})
            })
        }).catch((error: Error) => {
            res.render('error')
        })
    }
}