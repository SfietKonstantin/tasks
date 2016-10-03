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
        const id = Number(req.params.id)
        this.dataProvider.getProject(id).then((project: Project) => {
            res.render('project', {project: project})
        }).catch((error: Error) => {
            res.render('error')
        })
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