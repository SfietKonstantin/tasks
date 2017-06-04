import {Router} from "express"
import {IDaoBuilder} from "../dao/ibuilder"
import {asRoute, asParameterHandler, FeatureRequest, getFeatureIdentifier} from "./utils"
import {StoryApiProvider} from "../api/story"

export class ApiRouterFactory {
    private readonly storyApiProvider: StoryApiProvider

    constructor(daoBuilder: IDaoBuilder) {
        this.storyApiProvider = new StoryApiProvider(daoBuilder)
    }

    create(): Router {
        const apiRouter = Router()
        apiRouter.param("featureIdentifier", asParameterHandler((req: FeatureRequest) => {
            req.featureIdentifier = getFeatureIdentifier(req.params.featureIdentifier)
        }))

        apiRouter.get("/story/list", asRoute(() => {
            return this.storyApiProvider.getAllStories()
        }))

        return apiRouter
    }
}
