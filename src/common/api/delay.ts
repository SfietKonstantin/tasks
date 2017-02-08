import {InputError} from "../errors/input"
import {DelayDefinition} from "../delay"
import {Identifiable} from "../identifiable"

export interface ApiDelayDefinition extends Identifiable {
    name: string
    description: string
    date: string
}

export interface ApiDelay extends ApiDelayDefinition {
    initialMargin: number
    margin: number
}

export class DelayBuilder {
    static fromObject(input: any): DelayDefinition {
        if (!input.hasOwnProperty("identifier")) {
            throw new InputError("Property \"identifier\" cannot be found")
        }
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
        }
        if (!input.hasOwnProperty("date")) {
            throw new InputError("Property \"date\" cannot be found")
        }
        const identifier = input["identifier"]
        if (typeof identifier !== "string") {
            throw new InputError("Property \"identifier\" should be a string")
        }
        const name = input["name"]
        if (typeof name !== "string") {
            throw new InputError("Property \"name\" should be a string")
        }
        const description = input["description"]
        if (typeof description !== "string") {
            throw new InputError("Property \"description\" should be a string")
        }
        const date = input["date"]
        if (typeof date !== "string") {
            throw new InputError("Property \"date\" should be a string")
        }

        return {
            identifier,
            name,
            description,
            date: new Date(date)
        }
    }

    static toApiDelay(delay: DelayDefinition, initialMargin: number, margin: number): ApiDelay {
        return {
            identifier: delay.identifier,
            name: delay.name,
            description: delay.description,
            date: delay.date.toISOString(),
            initialMargin,
            margin
        }
    }

    static fromApiDelay(delay: ApiDelayDefinition): DelayDefinition {
        return {
            identifier: delay.identifier,
            name: delay.name,
            description: delay.description,
            date: new Date(delay.date)
        }
    }
}
