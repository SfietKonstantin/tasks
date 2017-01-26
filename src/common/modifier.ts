import {TaskLocation} from "./tasklocation"

export interface Modifier {
    name: string
    description: string
    duration: number
    location: TaskLocation
}
