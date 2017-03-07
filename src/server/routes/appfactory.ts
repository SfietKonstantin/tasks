import {Router, Request, Response} from "express"
import {
    asParameterHandler, ProjectRequest, TaskRequest, getProjectIdentifier,
    getTaskIdentifier
} from "./utils"

export class AppRouterFactory {
    static create(): Router {
        const appRouter = Router()
        appRouter.param("projectIdentifier", asParameterHandler((req: ProjectRequest) => {
            req.projectIdentifier = getProjectIdentifier(req.params.projectIdentifier)
        }))
        appRouter.param("taskIdentifier", asParameterHandler((req: TaskRequest) => {
            req.taskIdentifier = getTaskIdentifier(req.params.taskIdentifier)
        }))

        appRouter.get("/", (req: Request, res: Response) => {
            res.render("index")
        })

        appRouter.get("/project/:projectIdentifier", (req: ProjectRequest, res: Response) => {
            res.render("project", {projectIdentifier: req.projectIdentifier})
        })

        return appRouter
    }
}
