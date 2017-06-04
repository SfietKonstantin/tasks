import {Identifiable} from "../identifiable"
import {Story, StoryState} from "../story"
import {Person} from "../person"
import {ApiSprint, SprintBuilder} from "./sprint"
import {ApiFeature, FeatureBuilder} from "./feature"

export interface ApiStory extends Identifiable {
    name: string
    description: string
    duration: number
    feature: ApiFeature
    state: StoryState
    assignee: Person | null
    sprint: ApiSprint | null
}

export class StoryBuilder {
    static toApiStory(story: Story): ApiStory {
        return {
            identifier: story.identifier,
            name: story.name,
            description: story.description,
            duration: story.duration,
            feature: FeatureBuilder.toApiFeature(story.feature),
            state: story.state,
            assignee: story.assignee,
            sprint: story.sprint ? SprintBuilder.toApiSprint(story.sprint) : null
        }
    }

    static fromApiStory(story: ApiStory): Story {
        return {
            identifier: story.identifier,
            name: story.name,
            description: story.description,
            duration: story.duration,
            feature: FeatureBuilder.fromApiFeature(story.feature),
            state: story.state,
            assignee: story.assignee,
            sprint: story.sprint ? SprintBuilder.fromApiSprint(story.sprint) : null,
            visible: true
        }
    }
}
