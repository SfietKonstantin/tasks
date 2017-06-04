import * as chai from "chai"
import {StoryState} from "../../../../../common/story"
import {StoryStateBuilder} from "../../../../../server/dao/redis/utils/storystate"

describe("Redis DAO StoryState utils", () => {
    it("Should create a StoryState from correct input", () => {
        chai.expect(StoryStateBuilder.fromString("Todo")).to.equal(StoryState.Todo)
        chai.expect(StoryStateBuilder.fromString("InProgress")).to.equal(StoryState.InProgress)
        chai.expect(StoryStateBuilder.fromString("Done")).to.equal(StoryState.Done)
        chai.expect(StoryStateBuilder.fromString("Closed")).to.equal(StoryState.Closed)
    })
    it("Should not create a StoryState from incorrect input ", () => {
        chai.expect(StoryStateBuilder.fromString("test")).to.null
    })
    it("Should create correct strings from StoryState", () => {
        chai.expect(StoryStateBuilder.toString(StoryState.Todo)).to.equal("Todo")
        chai.expect(StoryStateBuilder.toString(StoryState.InProgress)).to.equal("InProgress")
        chai.expect(StoryStateBuilder.toString(StoryState.Done)).to.equal("Done")
        chai.expect(StoryStateBuilder.toString(StoryState.Closed)).to.equal("Closed")
    })
    it("Should create an empty string for an invalid StoryState", () => {
        chai.expect(StoryStateBuilder.toString(-1 as StoryState)).to.equal("")
    })
})

