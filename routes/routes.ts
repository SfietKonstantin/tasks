import * as express from "express"
import { IDataProvider } from "../idataprovider"

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
        let node = this.dataProvider.getNode(id)
        if (node == null) {
            res.render('error')
        } else {
            let project = this.dataProvider.getProject(node.task.projectId)
            if (project == null) {
                res.render('error')
            } else {
                res.render('task', {project: project, task: node.task})
            }
        }
    }
}