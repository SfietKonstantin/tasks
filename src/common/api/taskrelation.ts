import {TaskRelation} from "../taskrelation"
import {InputError} from "../errors/input"
import {TaskLocation} from "../tasklocation"

export class TaskRelationBuilder {
    static create(input: any): TaskRelation {
        if (!input.hasOwnProperty("previous")) {
            throw new InputError("Property \"previous\" cannot be found")
        }
        if (!input.hasOwnProperty("previousLocation")) {
            throw new InputError("Property \"previousLocation\" cannot be found")
        }
        if (!input.hasOwnProperty("next")) {
            throw new InputError("Property \"next\" cannot be found")
        }
        if (!input.hasOwnProperty("lag")) {
            throw new InputError("Property \"lag\" cannot be found")
        }
        const previous = input["previous"]
        if (typeof previous !== "string") {
            throw new InputError("Property \"previous\" should be a string")
        }
        const previousLocation = TaskRelationBuilder.parseTaskLocation(input["previousLocation"])
        if (previousLocation == null) {
            throw new InputError("Property \"previousLocation\" should be a TaskLocation")
        }
        const next = input["next"]
        if (typeof next !== "string") {
            throw new InputError("Property \"next\" should be a string")
        }
        const lag = input["lag"]
        if (typeof lag !== "number") {
            throw new InputError("Property \"lag\" should be a number")
        }

        return {
            previous,
            previousLocation,
            next,
            lag
        }
    }

    private static parseTaskLocation(location: any): TaskLocation | null {
        if (location === TaskLocation.Beginning) {
            return TaskLocation.Beginning
        } else if (location === TaskLocation.End) {
            return TaskLocation.End
        } else {
            return null
        }
    }
}
