import {Feature} from "../../common/feature"
import {Story, StoryState} from "../../common/story"

export const feature1: Feature = {
    identifier: "feature1",
    name: "Feature 1",
    description: "Feature description 1",
    color: "red",
    visible: true
}

export const feature2: Feature = {
    identifier: "feature2",
    name: "Feature 2",
    description: "Feature description 2",
    color: "blue",
    visible: true
}

export const feature3: Feature = {
    identifier: "feature3",
    name: "Feature 3",
    description: "Feature description 3",
    color: "green",
    visible: false
}

export const invalidFeature: Feature = {
    identifier: "invalidFeature",
    name: "Invalid feature",
    description: "Invalid feature description",
    color: "black",
    visible: false
}

export const story1: Story = {
    identifier: "1",
    name: "Story 1",
    description: "Story description 1",
    duration: 123,
    feature: feature1,
    state: StoryState.Todo,
    assignee: null,
    sprint: null,
    visible: true
}

export const story2: Story = {
    identifier: "2",
    name: "Story 2",
    description: "Story description 2",
    duration: 234,
    feature: feature1,
    state: StoryState.InProgress,
    assignee: null,
    sprint: null,
    visible: true
}

export const story3: Story = {
    identifier: "3",
    name: "Story 3",
    description: "Story description 3",
    duration: 345,
    feature: feature1,
    state: StoryState.Done,
    assignee: null,
    sprint: null,
    visible: false
}

export const invalidStory: Story = {
    identifier: "0",
    name: "Invalid story",
    description: "Invalid story description",
    duration: 0,
    feature: invalidFeature,
    state: StoryState.Closed,
    assignee: null,
    sprint: null,
    visible: false
}
