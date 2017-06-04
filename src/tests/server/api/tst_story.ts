import * as chai from "chai"
import {StoryApiProvider} from "../../../server/api/story"
import {ApiStory, StoryBuilder} from "../../../common/api/story"
import {story1, story2} from "../../common/testdata"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../server/error/request"
import {InternalError} from "../../../server/dao/error/internal"
import {FakeError} from "./fakeerror"

describe("API Story", () => {
    let daoBuilder: MockDaoBuilder
    let apiProvider: StoryApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        apiProvider = new StoryApiProvider(daoBuilder)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("getAllStories", () => {
        it("Should get a list of stories", () => {
            const expected: Array<ApiStory> = [
                StoryBuilder.toApiStory(story1),
                StoryBuilder.toApiStory(story2)
            ]
            daoBuilder.mockStoryDao.expects("getAllStories").once()
                .returns(Promise.resolve(expected))

            return apiProvider.getAllStories().then((stories: Array<ApiStory>) => {
                chai.expect(stories).to.deep.equal(expected)
            })
        })
        it("Should get an exception on internal error", () => {
            daoBuilder.mockStoryDao.expects("getAllStories").once()
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getAllStories().then(() => {
                throw new Error("getAllStories should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        it("Should get an exception on other error", () => {
            daoBuilder.mockStoryDao.expects("getAllStories").once()
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getAllStories().then(() => {
                throw new Error("getAllStories should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
})
