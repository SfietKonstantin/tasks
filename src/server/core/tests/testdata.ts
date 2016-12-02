import { IDataProvider } from "../data/idataprovider"
import {
    Project, TaskDefinition, TaskRelation, TaskLocation, DelayDefinition, DelayRelation
} from "../../../common/types"
import { IGraph, IProjectNode, ITaskNode } from "../graph/types"

const fillProjectsData = (graph: IGraph): Promise<IProjectNode> => {
    const project: Project = {
        identifier: "project",
        name: "Test project",
        description: "Test project description"
    }
    return graph.addProject(project)
}

const fillTasksData = (projectNode: IProjectNode): Promise<void> => {
    const tasks: Array<TaskDefinition> = [
        {
            identifier: "root",
            name: "Root task",
            description: "Project beginning",
            estimatedStartDate: new Date(2016, 7, 15),
            estimatedDuration: 31
        },
        {
            identifier: "long",
            name: "Long task",
            description: "Some long task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 60
        },
        {
            identifier: "short",
            name: "Short task",
            description: "Some short task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 31
        },
        {
            identifier: "reducing",
            name: "Reducing task",
            description: "Task depending on two tasks",
            estimatedStartDate: new Date(2016, 10, 16),
            estimatedDuration: 30
        }
    ]

    return Promise.all(tasks.map((task: TaskDefinition) => {
        return projectNode.addTask(task)
    }))
}

const fillDelays = (projectNode: IProjectNode): Promise<void> => {
    const delays: Array<DelayDefinition> = [
        {
            identifier: "delay1",
            name: "Delay 1",
            description: "Delay 1",
            date: new Date(2016, 9, 17)
        },
        {
            identifier: "delay2",
            name: "Delay 2",
            description: "Delay 2",
            date: new Date(2016, 11, 25)
        }
    ]

    return Promise.all(delays.map((delay: DelayDefinition) => {
        return projectNode.addDelay(delay)
    }))
}

const fillTaskRelations = (projectNode: IProjectNode): Promise<void> => {
    const relations: Array<TaskRelation> = [
        {
            previous: "root",
            previousLocation: TaskLocation.End,
            next: "long",
            lag: 0
        },
        {
            previous: "root",
            previousLocation: TaskLocation.End,
            next: "short",
            lag: 0
        },
        {
            previous: "long",
            previousLocation: TaskLocation.End,
            next: "reducing",
            lag: 0
        },
        {
            previous: "short",
            previousLocation: TaskLocation.End,
            next: "reducing",
            lag: 0
        }
    ]
    return Promise.all(relations.map((relation: TaskRelation) => {
        projectNode.addTaskRelation(relation)
    }))
}

const fillDelayRelations = (projectNode: IProjectNode): Promise<void> => {
    const relations: Array<DelayRelation> = [
        {
            task: "short",
            delay: "delay1",
            lag: 0
        },
        {
            task: "reducing",
            delay: "delay2",
            lag: 0
        }
    ]
    return Promise.all(relations.map((relation: DelayRelation) => {
        projectNode.addDelayRelation(relation)
    }))
}

export const fillTestData = (dataProvider: IDataProvider, graph: IGraph): Promise<void> => {
    return fillProjectsData(graph).then((projectNode: IProjectNode) => {
        return fillTasksData(projectNode).then(() => {
            return fillTaskRelations(projectNode)
        }).then(() => {
            return fillDelays(projectNode)
        }).then(() => {
            return fillDelayRelations(projectNode)
        })
    })
}
