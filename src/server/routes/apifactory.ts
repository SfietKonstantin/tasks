import {Router, Request} from "express"
import {IDaoBuilder} from "../dao/ibuilder"
import {asRoute, asParameterHandler, FeatureRequest, getFeatureIdentifier} from "./utils"
import {FeatureApiProvider} from "../api/feature"
import {StoryApiProvider} from "../api/story"

export class ApiRouterFactory {
    private readonly featureApiProvider: FeatureApiProvider
    private readonly storyApiProvider: StoryApiProvider

    constructor(daoBuilder: IDaoBuilder) {
        this.featureApiProvider = new FeatureApiProvider(daoBuilder)
        this.storyApiProvider = new StoryApiProvider(daoBuilder)
    }

    create(): Router {
        const apiRouter = Router()
        apiRouter.param("featureIdentifier", asParameterHandler((req: FeatureRequest) => {
            req.featureIdentifier = getFeatureIdentifier(req.params.featureIdentifier)
        }))

        apiRouter.get("/feature/list", asRoute(() => {
            return this.featureApiProvider.getAllFeatures()
        }))

        apiRouter.put("/feature", asRoute((req: Request) => {
            return this.featureApiProvider.addFeature(req.body)
        }))

        apiRouter.get("/story/list", asRoute(() => {
            return this.storyApiProvider.getAllStories()
        }))

        return apiRouter
    }
}
