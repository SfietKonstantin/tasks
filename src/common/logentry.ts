import {Story, StoryState} from "./story"
import {Sprint, SprintState} from "./sprint"
import {Feature} from "./feature"

enum LogEvent {
    FeatureCreated,
    FeatureRemoved,
    StoryCreated,
    StoryRemoved,
    StoryAddedInSprint,
    StoryRemovedFromSprint,
    StoryStateChanged,
    SprintStateChanged
}

export interface LogEntry {
    event: LogEvent
    feature?: Feature
    story?: Story
    sprint?: Sprint
    storyOldState: StoryState
    storyNewState: StoryState
    sprintOldState: SprintState
    sprintNewState: SprintState
}
