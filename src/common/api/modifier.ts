import {Modifier} from "../old/modifier"
import {InputError} from "../errors/input"
import {TaskLocationBuilder} from "./tasklocation"

export class ModifierBuilder {
    static fromObject(input: any): Modifier {
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
        }
        if (!input.hasOwnProperty("duration")) {
            throw new InputError("Property \"duration\" cannot be found")
        }
        if (!input.hasOwnProperty("location")) {
            throw new InputError("Property \"location\" cannot be found")
        }
        const name = input["name"]
        if (typeof name !== "string") {
            throw new InputError("Property \"name\" should be a string")
        }
        const description = input["description"]
        if (typeof description !== "string") {
            throw new InputError("Property \"description\" should be a string")
        }
        const duration = input["duration"]
        if (typeof duration !== "number") {
            throw new InputError("Property \"duration\" should be a number")
        }
        const location = TaskLocationBuilder.fromObject(input["location"])
        if (location == null) {
            throw new InputError("Property \"location\" should be a TaskLocation")
        }

        return {
            name,
            description,
            duration,
            location
        }
    }
}
