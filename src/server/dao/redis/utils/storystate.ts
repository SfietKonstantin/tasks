import {StoryState} from "../../../../common/story"

export class StoryStateBuilder {
    static toString(storyState: StoryState): string {
        switch (storyState) {
            case StoryState.Todo:
                return "Todo"
            case StoryState.InProgress:
                return "InProgress"
            case StoryState.Done:
                return "Done"
            case StoryState.Closed:
                return "Closed"
            default:
                return ""
        }
    }

    static fromString(storyState: string): StoryState | null {
        if (storyState === "Todo") {
            return StoryState.Todo
        } else if (storyState === "InProgress") {
            return StoryState.InProgress
        } else if (storyState === "Done") {
            return StoryState.Done
        } else if (storyState === "Closed") {
            return StoryState.Closed
        } else {
            return null
        }
    }
}

