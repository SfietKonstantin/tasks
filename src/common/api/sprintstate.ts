import {SprintState} from "../sprint"

export class SprintStateBuilder {
    static fromObject(state: any): SprintState | null {
        if (state === SprintState.Pending) {
            return SprintState.Pending
        } else if (state === SprintState.Ongoing) {
            return SprintState.Ongoing
        } else if (state === SprintState.Done) {
            return SprintState.Done
        } else {
            return null
        }
    }
}
