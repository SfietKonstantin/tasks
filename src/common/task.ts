import {Identifiable} from "./identifiable"
import {Person} from "./person"
import {Sprint} from "./sprint"
import {Feature} from "./feature"

export enum TaskState {
    Todo,
    InProgress,
    Done,
    Closed
}

export interface Task extends Identifiable {
    name: string
    description: string
    duration: number
    feature: Feature
    state: TaskState
    assignee: Person | null
    sprint: Sprint | null
    visible: boolean // visible = false means removed
}
