import {TaskLocation} from "./tasklocation"

export interface TaskRelation {
    previous: string
    previousLocation: TaskLocation
    next: string
    lag: number
}
