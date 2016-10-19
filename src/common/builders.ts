import { Project, Task, TaskResults } from "./types"

export class InvalidInput extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export const buildProject = (input: any): Project => {
    if (!input.hasOwnProperty("identifier")) {
        throw new InvalidInput("Property \"identifier\" cannot be found")
    }
    if (!input.hasOwnProperty("name")) {
        throw new InvalidInput("Property \"name\" cannot be found")
    }
    if (!input.hasOwnProperty("description")) {
        throw new InvalidInput("Property \"description\" cannot be found")
    }
    return {
        identifier: input["identifier"],
        name: input["name"],
        description: input["description"]
    }
}
