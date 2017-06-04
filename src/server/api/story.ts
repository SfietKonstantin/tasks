import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {RequestError} from "../error/request"
import {ApiStory, StoryBuilder} from "../../common/api/story"
import {ApiErrorUtils} from "./error/utils"
import {Story} from "../../common/story"

export class StoryApiProvider {
    private readonly daoBuilder: IDaoBuilder

    constructor(daoBuilder: IDaoBuilder) {
        this.daoBuilder = daoBuilder
    }

    getAllStories(): Promise<Array<ApiStory>> {
        const storyDao = this.daoBuilder.buildStoryDao()
        return storyDao.getAllStories().then((story: Array<Story>) => {
            return story.map((story: Story) => {
                return StoryBuilder.toApiStory(story)
            })
        }).catch((error: Error) => {
            if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }
}
