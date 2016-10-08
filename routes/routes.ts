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
        res.render('index')
    }
    getProject(req: express.Request, res: express.Response) {
        const identifier = String(req.params.identifier)
        res.render('project', {identifier: identifier})
    }
    getTask(req: express.Request, res: express.Response) {
        const identifier = String(req.params.identifier)
        res.render('task', {identifier: identifier})
    }
}