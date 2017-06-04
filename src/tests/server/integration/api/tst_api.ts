import * as supertest from "supertest"
import {Main} from "../../../../server/main"
import {RedisTestDataProvider} from "../../dao/redis/testdataprovider"
import {story1, story2} from "../../../common/testdata"
import {StoryBuilder} from "../../../../common/api/story";

describe("Integration API", () => {
    let main: Main
    beforeEach(() => {
        return RedisTestDataProvider.dumpOnly().then(() => {
            main = new Main(3)
            return main.start(8080)
        })
    })
    afterEach(() => {
        main.stop()
    })
    it("Should get a list of stories", (done) => {
        const stories = [
            StoryBuilder.toApiStory(story1),
            StoryBuilder.toApiStory(story2)
        ]
        supertest("http://localhost:8080")
            .get("/api/story/list")
            .expect("Content-Type", /json/)
            .expect(stories)
            .expect(200, done)
    })
})
