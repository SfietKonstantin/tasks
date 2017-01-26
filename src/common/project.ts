import {Identifiable} from "./identifiable"

export interface Project extends Identifiable {
    name: string
    description: string
}
