import {Identifiable} from "./identifiable"

export interface DelayDefinition extends Identifiable {
    name: string
    description: string
    date: Date
}