import {DelayRelation} from "../old/delayrelation"
import {InputError} from "../errors/input"

export class DelayRelationBuilder {
    static fromObject(input: any): DelayRelation {
        if (!input.hasOwnProperty("delay")) {
            throw new InputError("Property \"delay\" cannot be found")
        }
        if (!input.hasOwnProperty("task")) {
            throw new InputError("Property \"task\" cannot be found")
        }
        if (!input.hasOwnProperty("lag")) {
            throw new InputError("Property \"lag\" cannot be found")
        }
        const delay = input["delay"]
        if (typeof delay !== "string") {
            throw new InputError("Property \"delay\" should be a string")
        }
        const task = input["task"]
        if (typeof task !== "string") {
            throw new InputError("Property \"task\" should be a string")
        }
        const lag = input["lag"]
        if (typeof lag !== "number") {
            throw new InputError("Property \"lag\" should be a number")
        }

        return {
            delay,
            task,
            lag
        }
    }
}
