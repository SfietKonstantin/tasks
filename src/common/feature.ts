import {Identifiable} from "./identifiable"

export interface Feature extends Identifiable {
    name: string
    description: string
    color: string
    visible: boolean // visible = false means removed
}
