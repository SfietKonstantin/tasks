import {Identifiable} from "../identifiable"
import {
    TaskDefinition as CoreTaskDefinition,
    Task as CoreTask
} from "../task"
import {InputError} from "../errors/input"

export interface TaskDefinition extends Identifiable {
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
}

export interface Task extends TaskDefinition {
    startDate: string
    duration: number
}

export class Builder {
    static create(input: any): CoreTaskDefinition {
        if (!input.hasOwnProperty("identifier")) {
            throw new InputError("Property \"identifier\" cannot be found")
        }
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
        }
        if (!input.hasOwnProperty("estimatedStartDate")) {
            throw new InputError("Property \"estimatedStartDate\" cannot be found")
        }
        if (!input.hasOwnProperty("estimatedDuration")) {
            throw new InputError("Property \"estimatedDuration\" cannot be found")
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
        const estimatedStartDate = input["estimatedStartDate"]
        if (typeof estimatedStartDate !== "string") {
            throw new InputError("Property \"estimatedStartDate\" should be a string")
        }
        const estimatedDuration = input["estimatedDuration"]
        if (typeof estimatedDuration !== "number") {
            throw new InputError("Property \"estimatedDuration\" should be a number")
        }

        return {
            identifier,
            name,
            description,
            estimatedStartDate: new Date(estimatedStartDate),
            estimatedDuration
        }
    }

    static to(task: CoreTask): Task {
        return {
            identifier: task.identifier,
            name: task.name,
            description: task.description,
            estimatedStartDate: task.estimatedStartDate.toISOString(),
            estimatedDuration: task.estimatedDuration,
            startDate: task.startDate.toISOString(),
            duration: task.duration
        }
    }

    static from(task: Task): CoreTask {
        return {
            identifier: task.identifier,
            name: task.name,
            description: task.description,
            estimatedStartDate: new Date(task.estimatedStartDate),
            estimatedDuration: task.estimatedDuration,
            startDate: new Date(task.startDate),
            duration: task.duration
        }
    }
}
