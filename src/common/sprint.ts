import {Identifiable} from "./identifiable"

export enum SprintState {
    Pending,
    Ongoing,
    Done
}

export interface Sprint extends Identifiable {
    name: string
    description: string
    startDate: Date
    endDate: Date
    state: SprintState
}
