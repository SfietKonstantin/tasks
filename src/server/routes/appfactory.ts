import {Router, Request, Response} from "express"

export class AppRouterFactory {
    static create(): Router {
        const appRouter = Router()
        appRouter.get("/", (req: Request, res: Response) => {
            res.render("index", {currentTab: ""})
        })

        appRouter.get("/story/", (req: Request, res: Response) => {
            res.render("story", {currentTab: "story"})
        })

        appRouter.get("/feature/", (req: Request, res: Response) => {
            res.render("feature", {currentTab: "feature"})
        })

        return appRouter
    }
}
