import {Identifiable} from "../identifiable"
import {Sprint, SprintState} from "../sprint"
import {InputError} from "../errors/input"
import {SprintStateBuilder} from "./sprintstate"

export interface ApiSprint extends Identifiable {
    name: string
    description: string
    startDate: string
    endDate: string
    state: SprintState
}

export class SprintBuilder {
    static fromObject(input: any): Sprint {
        if (!input.hasOwnProperty("identifier")) {
            throw new InputError("Property \"identifier\" cannot be found")
        }
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
        }
        if (!input.hasOwnProperty("startDate")) {
            throw new InputError("Property \"startDate\" cannot be found")
        }
        if (!input.hasOwnProperty("endDate")) {
            throw new InputError("Property \"endDate\" cannot be found")
        }
        if (!input.hasOwnProperty("state")) {
            throw new InputError("Property \"state\" cannot be found")
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
        const startDate = input["startDate"]
        if (typeof startDate !== "string") {
            throw new InputError("Property \"startDate\" should be a string")
        }
        const endDate = input["endDate"]
        if (typeof endDate !== "string") {
            throw new InputError("Property \"endDate\" should be a string")
        }
        const state = SprintStateBuilder.fromObject(input["state"])
        if (state == null) {
            throw new InputError("Property \"state\" should be a SprintState")
        }

        return {
            identifier,
            name,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            state
        }
    }

    static toApiSprint(sprint: Sprint): ApiSprint {
        return {
            identifier: sprint.identifier,
            name: sprint.name,
            description: sprint.description,
            startDate: sprint.startDate.toISOString(),
            endDate: sprint.endDate.toISOString(),
            state: sprint.state
        }
    }

    static fromApiSprint(sprint: ApiSprint): Sprint {
        return {
            identifier: sprint.identifier,
            name: sprint.name,
            description: sprint.description,
            startDate: new Date(sprint.startDate),
            endDate: new Date(sprint.endDate),
            state: sprint.state
        }
    }
}
