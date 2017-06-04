import {Project} from "../../../common/old/project"
import {TaskDefinition, Task} from "../../../common/old/task"

export const project1: Project = {
    identifier: "project1",
    name: "Project 1",
    description: "Project description 1"
}

export const project2: Project = {
    identifier: "project2",
    name: "Project 2",
    description: "Project description 2"
}

export const project3: Project = {
    identifier: "project3",
    name: "Project 3",
    description: "Project description 3"
}

export const invalidProject: Project = {
    identifier: "invalidProject",
    name: "Invalid project",
    description: "Invalid project description"
}

export const taskd1: TaskDefinition = {
    identifier: "task1",
    name: "Task 1",
    description: "Task description 1 (Root task)",
    estimatedStartDate: new Date(2016, 7, 15),
    estimatedDuration: 31
}

export const taskd2: TaskDefinition = {
    identifier: "task2",
    name: "Task 2",
    description: "Task description 2 (Long task)",
    estimatedStartDate: new Date(2016, 8, 15),
    estimatedDuration: 60
}

export const task1: Task = {
    identifier: taskd1.identifier,
    name: taskd1.name,
    description: taskd1.description,
    estimatedStartDate: taskd1.estimatedStartDate,
    estimatedDuration: taskd1.estimatedDuration,
    startDate: new Date(2016, 7, 15),
    duration: 31
}

export const task2: Task = {
    identifier: taskd2.identifier,
    name: taskd2.name,
    description: taskd2.description,
    estimatedStartDate: taskd2.estimatedStartDate,
    estimatedDuration: taskd2.estimatedDuration,
    startDate: new Date(2016, 8, 18),
    duration: 32
}
