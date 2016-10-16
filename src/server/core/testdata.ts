import { IDataProvider } from "./data/idataprovider"
import { Project, Task } from "./../../common/types"
import * as graph from "./graph/graph"

const fillProjectsData = (dataProvider: IDataProvider): Promise<void> => {
    const project: Project = {
        identifier: "project",
        name: "Test project",
        description: "Test project description"
    }
    return dataProvider.addProject(project)
}

const fillTasksData = (dataProvider: IDataProvider): Promise<void> => {
    let tasks: Array<Task> = [
        {
            identifier: "root",
            projectIdentifier: "project",
            name: "Root task",
            description: "Project beginning",
            estimatedStartDate: new Date(2016, 7, 15),
            estimatedDuration: 31
        },
        {
            identifier: "long",
            projectIdentifier: "project",
            name: "Long task",
            description: "Some long task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 60
        },
        {
            identifier: "short",
            projectIdentifier: "project",
            name: "Short task",
            description: "Some short task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 31
        },
        {
            identifier: "reduce",
            projectIdentifier: "project",
            name: "Reducing task",
            description: "Task depending on two tasks",
            estimatedStartDate: new Date(2016, 10, 16),
            estimatedDuration: 30
        }
    ]

    const mappedTasks = tasks.map((task: Task) => { return dataProvider.addTask(task) })
    return Promise.all(mappedTasks).then((ids) => {})
}

const fillTaskRelations = (dataProvider: IDataProvider): Promise<void> => {
    return dataProvider.setTaskRelation("project", "root", "long").then(() => {
        return dataProvider.setTaskRelation("project", "root", "short")
    }).then(() => {
        return dataProvider.setTaskRelation("project", "long", "reduce")
    }).then(() => {
        return dataProvider.setTaskRelation("project", "long", "reduce")
    })
}

export const fillTestData = (dataProvider: IDataProvider) => {
    dataProvider.getAllProjects().then((projects: Array<Project>) => {
        if (projects.length === 0) {
            return fillProjectsData(dataProvider).then(() => {
                return fillTasksData(dataProvider)
            }).then(() => {
                return fillTaskRelations(dataProvider)
            }).then(() => {
                const persistance = new graph.GraphPersistence("project", dataProvider)
                return persistance.loadGraph("root").then(() => {
                    return persistance.loadData()
                }).then(() => {
                    graph.compute(persistance.root)
                    return persistance.save()
                })
            })
        }
    })
}
