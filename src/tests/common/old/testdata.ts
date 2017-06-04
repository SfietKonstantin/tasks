import {Project} from "../../../common/old/project"
import {TaskDefinition, Task} from "../../../common/old/task"
import {TaskLocation} from "../../../common/old/tasklocation"
import {TaskRelation} from "../../../common/old/taskrelation"
import {DelayDefinition} from "../../../common/old/delay"
import {DelayRelation} from "../../../common/old/delayrelation"
import {Modifier} from "../../../common/old/modifier"

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

export const taskd3: TaskDefinition = {
    identifier: "task3",
    name: "Task 3",
    description: "Task description 3 (Short task)",
    estimatedStartDate: new Date(2016, 8, 15),
    estimatedDuration: 31
}

export const taskd4: TaskDefinition = {
    identifier: "task4",
    name: "Task 4",
    description: "Task description 4 (Task depending on two tasks)",
    estimatedStartDate: new Date(2016, 10, 16),
    estimatedDuration: 30
}

export const milestoned1: TaskDefinition = {
    identifier: "milestone1",
    name: "Milestone 1",
    description: "Milestone description 1",
    estimatedStartDate: new Date(2016, 7, 15),
    estimatedDuration: 0
}

export const invalidTaskd: TaskDefinition = {
    identifier: "invalidTaskd",
    name: "Invalid task",
    description: "Invalid task description",
    estimatedStartDate: new Date(2000, 0, 1),
    estimatedDuration: 0
}

export const taskRelation1: TaskRelation = {
    previous: taskd1.identifier,
    previousLocation: TaskLocation.End,
    next: taskd2.identifier,
    lag: 0
}

export const taskRelation2: TaskRelation = {
    previous: taskd1.identifier,
    previousLocation: TaskLocation.End,
    next: taskd3.identifier,
    lag: 1
}

export const taskRelation3: TaskRelation = {
    previous: taskd2.identifier,
    previousLocation: TaskLocation.End,
    next: taskd3.identifier,
    lag: 2
}

export const taskRelation4: TaskRelation = {
    previous: taskd2.identifier,
    previousLocation: TaskLocation.End,
    next: taskd4.identifier,
    lag: 0
}

export const taskRelation5: TaskRelation = {
    previous: taskd3.identifier,
    previousLocation: TaskLocation.End,
    next: taskd4.identifier,
    lag: 0
}

export const taskRelation6: TaskRelation = {
    previous: taskd2.identifier,
    previousLocation: TaskLocation.End,
    next: taskd1.identifier,
    lag: 0
}

export const taskRelation7: TaskRelation = {
    previous: taskd2.identifier,
    previousLocation: TaskLocation.Beginning,
    next: taskd1.identifier,
    lag: 0
}

export const invalidTaskRelation1: TaskRelation = {
    previous: invalidTaskd.identifier,
    previousLocation: TaskLocation.End,
    next: taskd1.identifier,
    lag: 0
}

export const invalidTaskRelation2: TaskRelation = {
    previous: taskd1.identifier,
    previousLocation: TaskLocation.End,
    next: invalidTaskd.identifier,
    lag: 0
}

export const delayd1: DelayDefinition = {
    identifier: "delay1",
    name: "Delay 1",
    description: "Delay description 1",
    date: new Date(2016, 11, 25)
}

export const delayd2: DelayDefinition = {
    identifier: "delay2",
    name: "Delay 2",
    description: "Delay description 2",
    date: new Date(2016, 11, 30)
}

export const delayd3: DelayDefinition = {
    identifier: "delay3",
    name: "Delay 3",
    description: "Description 3",
    date: new Date(2016, 10, 15)
}

export const invalidDelay: DelayDefinition = {
    identifier: "invalidDelay",
    name: "Invalid delay",
    description: "Invalid description",
    date: new Date(2000, 0, 1)
}

export const delayRelation1: DelayRelation = {
    task: taskd1.identifier,
    delay: delayd1.identifier,
    lag: 0
}

export const delayRelation2: DelayRelation = {
    task: taskd2.identifier,
    delay: delayd1.identifier,
    lag: 5
}

export const delayRelation3: DelayRelation = {
    task: taskd1.identifier,
    delay: delayd2.identifier,
    lag: 10
}

export const delayRelation4: DelayRelation = {
    task: taskd4.identifier,
    delay: delayd1.identifier,
    lag: 0
}

export const delayRelation5: DelayRelation = {
    task: taskd4.identifier,
    delay: delayd2.identifier,
    lag: 5
}

export const invalidDelayRelation1: DelayRelation = {
    task: taskd1.identifier,
    delay: invalidDelay.identifier,
    lag: 0
}

export const invalidDelayRelation2: DelayRelation = {
    task: invalidTaskd.identifier,
    delay: delayd2.identifier,
    lag: 0
}

export const modifier1: Modifier = {
    name: "Modifier 1",
    description: "Modifier description 1 (Root task modifier)",
    duration: 5,
    location: TaskLocation.End
}

export const modifier2: Modifier = {
    name: "Modifier 2",
    description: "Modifier description 2 (Short task modifier)",
    duration: 10,
    location: TaskLocation.Beginning
}

export const modifier3: Modifier = {
    name: "Modifier 3",
    description: "Modifier description 3 (Short task modifier)",
    duration: 24,
    location: TaskLocation.End
}

export const modifier4: Modifier = {
    name: "Modifier 4",
    description: "Description 4",
    duration: 20,
    location: TaskLocation.Beginning
}

export const modifier5: Modifier = {
    name: "Modifier 5",
    description: "Modifier with a negative duration",
    duration: -2,
    location: TaskLocation.End
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
