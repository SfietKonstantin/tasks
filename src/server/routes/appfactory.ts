import {Router, Request, Response} from "express"

export class AppRouterFactory {
    static create(): Router {
        const appRouter = Router()
        appRouter.get("/", (req: Request, res: Response) => {
            res.render("index", {currentTab: ""})
        })

        appRouter.get("/stories/", (req: Request, res: Response) => {
            res.render("stories", {currentTab: "stories"})
        })

        return appRouter
    }
}
