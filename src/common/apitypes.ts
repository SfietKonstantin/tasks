import { Identifiable, Project, Task, TaskResults, TaskRelation, TaskLocation, Modifier } from "./types"
import { InputError } from "./errors"

export interface ApiInputTask extends Identifiable {
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
}

export interface ApiInputDelay extends Identifiable {
    name: string
    description: string
    date: string
}

export interface ApiTask extends Identifiable {
    name: string
    description: string
    estimatedStartDate: string
    estimatedDuration: number
    startDate: string
    duration: number
}

export interface ApiProjectTaskModifiers {
    project: Project
    task: ApiTask
    modifiers: Array<Modifier>
}

export const createApiTask = (task: Task, startDate: Date, duration: number): ApiTask => {
    return {
        identifier: task.identifier,
        name: task.name,
        description: task.description,
        estimatedStartDate: task.estimatedStartDate.toISOString(),
        estimatedDuration: task.estimatedDuration,
        startDate: startDate.toISOString(),
        duration
    }
}

export const createTaskFromApiTask = (project: Project, apiTask: ApiTask): Task => {
    return {
        identifier: apiTask.identifier,
        name: apiTask.name,
        description: apiTask.description,
        estimatedStartDate: new Date(apiTask.estimatedStartDate),
        estimatedDuration: apiTask.estimatedDuration
    }
}

export const createTaskResultsFromApiTask = (apiTask: ApiTask): TaskResults => {
    return {
        startDate: new Date(apiTask.startDate),
        duration: apiTask.duration
    }
}

export const createProject = (input: any): Project => {
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

export const createTask = (input: any): Task => {
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

const parseTaskLocation = (location: any): TaskLocation | null => {
    if (location === TaskLocation.Beginning) {
        return TaskLocation.Beginning
    } else if (location === TaskLocation.End) {
        return TaskLocation.End
    } else {
        return null
    }
}

export const createRelation = (input: any): TaskRelation => {
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
    const previousLocation = parseTaskLocation(input["previousLocation"])
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
