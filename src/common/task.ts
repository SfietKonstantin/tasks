import {Identifiable} from "./identifiable"

export interface TaskDefinition extends Identifiable {
    name: string
    description: string
    estimatedStartDate: Date
    estimatedDuration: number
}

export interface Task extends TaskDefinition {
    startDate: Date
    duration: number
}
