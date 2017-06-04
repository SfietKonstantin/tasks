import {StoryState} from "../story"

export class StoryStateBuilder {
    static fromObject(state: any): StoryState | null {
        if (state === StoryState.Todo) {
            return StoryState.Todo
        } else if (state === StoryState.InProgress) {
            return StoryState.InProgress
        } else if (state === StoryState.Done) {
            return StoryState.Done
        } else if (state === StoryState.Closed) {
            return StoryState.Closed
        } else {
            return null
        }
    }
}
