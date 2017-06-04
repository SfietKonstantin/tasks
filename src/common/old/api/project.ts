import {Project} from "../project"
import {InputError} from "../../errors/input"

export class ProjectBuilder {
    static fromObject(input: any): Project {
        if (!input.hasOwnProperty("identifier")) {
            throw new InputError("Property \"identifier\" cannot be found")
        }
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
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

        return {
            identifier,
            name,
            description
        }
    }
}
