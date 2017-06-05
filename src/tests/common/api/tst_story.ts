import * as chai from "chai"
import {ApiStory, StoryBuilder} from "../../../common/api/story"
import {Story, StoryState} from "../../../common/story"
import {SprintState} from "../../../common/sprint"

describe("API StoryBuilder", () => {
    const apiStory1: ApiStory = {
        identifier: "story_identifier",
        name: "Story name",
        description: "Story description",
        duration: 123,
        feature: {
            identifier: "feature_identifier",
            name: "Feature name",
            description: "Feature description",
            color: "red"
        },
        state: StoryState.Todo,
        assignee: {
            identifier: "assignee_identifier",
            firstName: "First name",
            lastName: "Last name",
            image: "http://images/user"
        },
        sprint: {
            identifier: "sprint_identifier",
            name: "Sprint name",
            description: "Sprint description",
            startDate: new Date(2015, 3, 15).toISOString(),
            endDate: new Date(2015, 3, 30).toISOString(),
            state: SprintState.Pending
        }
    }
    const apiStory2: ApiStory = {
        identifier: apiStory1.identifier,
        name: apiStory1.name,
        description: apiStory1.description,
        duration: apiStory1.duration,
        feature: apiStory1.feature,
        state: StoryState.Todo,
        assignee: null,
        sprint: null
    }
    const story1: Story = {
        identifier: "story_identifier",
        name: "Story name",
        description: "Story description",
        duration: 123,
        feature: {
            identifier: "feature_identifier",
            name: "Feature name",
            description: "Feature description",
            color: "red",
            visible: true
        },
        state: StoryState.Todo,
        assignee: {
            identifier: "assignee_identifier",
            firstName: "First name",
            lastName: "Last name",
            image: "http://images/user"
        },
        sprint: {
            identifier: "sprint_identifier",
            name: "Sprint name",
            description: "Sprint description",
            startDate: new Date(2015, 3, 15),
            endDate: new Date(2015, 3, 30),
            state: SprintState.Pending
        },
        visible: true
    }
    const story2: Story = {
        identifier: story1.identifier,
        name: story1.name,
        description: story1.description,
        duration: story1.duration,
        feature: story1.feature,
        state: StoryState.Todo,
        assignee: null,
        sprint: null,
        visible: story1.visible
    }
    it("Should convert a Story to an API Story", () => {
        chai.expect(StoryBuilder.toApiStory(story1)).to.deep.equal(apiStory1)
        chai.expect(StoryBuilder.toApiStory(story2)).to.deep.equal(apiStory2)
    })
    it("Should convert an API Story to a Story", () => {
        chai.expect(StoryBuilder.fromApiStory(apiStory1)).to.deep.equal(story1)
        chai.expect(StoryBuilder.fromApiStory(apiStory2)).to.deep.equal(story2)
    })
})
