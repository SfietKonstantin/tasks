import {TaskLocation} from "../tasklocation"

export class TaskLocationBuilder {
    static fromObject(location: any): TaskLocation | null {
        if (location === TaskLocation.Beginning) {
            return TaskLocation.Beginning
        } else if (location === TaskLocation.End) {
            return TaskLocation.End
        } else {
            return null
        }
    }
}
