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
    getProject(req: express.Request, res: express.Response) {
        const id = +String(req.params.id)
        if (!Number.isNaN(id)) {
            res.render('project', {id: id})
        } else {
            res.render('error')
        }
    }
    getTask(req: express.Request, res: express.Response) {
        const id = +String(req.params.id)
        if (!Number.isNaN(id)) {
            res.render('task', {id: id})
        } else {
            res.render('error')
        }
    }
}