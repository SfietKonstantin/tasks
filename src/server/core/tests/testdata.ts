import { IDataProvider } from "../data/idataprovider"
import { Project, Task, TaskRelation, TaskLocation } from "../../../common/types"
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
    const tasks: Array<Task> = [
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

    return Promise.all(tasks.map((task: Task) => {
        return projectNode.addTask(task)
    }))
}

const fillTaskRelations = (projectNode: IProjectNode): Promise<void> => {
    const relations: Array<TaskRelation> = [
        {
            previous: "root",
            previousLocation: TaskLocation.End,
            next: "long",
            nextLocation: TaskLocation.Beginning,
            lag: 0
        },
        {
            previous: "root",
            previousLocation: TaskLocation.End,
            next: "short",
            nextLocation: TaskLocation.Beginning,
            lag: 0
        },
        {
            previous: "long",
            previousLocation: TaskLocation.End,
            next: "reducing",
            nextLocation: TaskLocation.Beginning,
            lag: 0
        },
        {
            previous: "short",
            previousLocation: TaskLocation.End,
            next: "reducing",
            nextLocation: TaskLocation.Beginning,
            lag: 0
        }
    ]
    return Promise.all(relations.map((relation: TaskRelation) => {
        projectNode.addRelation(relation)
    }))
}

export const fillTestData = (dataProvider: IDataProvider, graph: IGraph): Promise<void> => {
    if (graph.nodes.size !== 0) {
        return Promise.resolve()
    }

    return fillProjectsData(graph).then((projectNode: IProjectNode) => {
        return fillTasksData(projectNode).then(() => {
            return fillTaskRelations(projectNode)
        })
    })
}
