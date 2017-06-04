import {Identifiable} from "./identifiable"
import {Person} from "./person"
import {Sprint} from "./sprint"
import {Feature} from "./feature"

export enum StoryState {
    Todo,
    InProgress,
    Done,
    Closed
}

export interface StoryContent {
    name: string
    description: string
    duration: number
    feature: Feature
    state: StoryState
    assignee: Person | null
    sprint: Sprint | null
    visible: boolean // visible = false means removed
}

export interface Story extends Identifiable, StoryContent {
}
