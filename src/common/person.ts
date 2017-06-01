import {Identifiable} from "./identifiable"

export interface Person extends Identifiable {
    firstName: string
    lastName: string
    image: string
}
