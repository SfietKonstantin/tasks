import {TaskLocation} from "../../../../common/old/tasklocation"

export class TaskLocationBuilder {

    static toString(location: TaskLocation): string {
        switch (location) {
            case TaskLocation.Beginning:
                return "Beginning"
            case TaskLocation.End:
                return "End"
            default:
                return ""
        }
    }

    static fromString(location: string): TaskLocation | null {
        if (location === "Beginning") {
            return TaskLocation.Beginning
        } else if (location === "End") {
            return TaskLocation.End
        } else {
            return null
        }
    }
}

