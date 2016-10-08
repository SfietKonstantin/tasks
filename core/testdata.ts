import { IDataProvider } from "./data/idataprovider"
import { Project, Task } from "./types"
import * as graph from "./graph/graph"

function fillProjectsData(dataProvider: IDataProvider) : Promise<number> {
    const project: Project = {
        id: 1,
        name: "Test project",
        description: "Test project description"
    }
    return dataProvider.addProject(project)
}

function fillTasksData(dataProvider: IDataProvider, projectId: number) : Promise<void> {
    let tasks: Array<Task> = [
        {
            id: null,
            projectId: null,
            name: "Root task",
            description: "Project beginning",
            estimatedStartDate: new Date(2016, 7, 15),
            estimatedDuration: 31
        },
        {
            id: null,
            projectId: null,
            name: "Long task",
            description: "Some long task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 60
        },
        {
            id: null,
            projectId: null,
            name: "Short task",
            description: "Some short task",
            estimatedStartDate: new Date(2016, 8, 15),
            estimatedDuration: 31
        },
        {
            id: null,
            projectId: null,
            name: "Reducing task",
            description: "Task depending on two tasks",
            estimatedStartDate: new Date(2016, 10, 16),
            estimatedDuration: 30
        }
    ]
                
    const mappedTasks = tasks.map((task: Task) => { return dataProvider.addTask(projectId, task) })
    return Promise.all(mappedTasks).then((ids) => {})
}

function fillTaskRelations(dataProvider: IDataProvider) : Promise<void> {
    return dataProvider.setTaskRelation(1, 2).then(() => {
        return dataProvider.setTaskRelation(1, 3)
    }).then(() => {
        return dataProvider.setTaskRelation(2, 4)
    }).then(() => {
        return dataProvider.setTaskRelation(3, 4)
    })
}

export function fillTestData(dataProvider: IDataProvider) {
    dataProvider.getAllProjects().then((projects: Array<Project>) => {
        if (projects.length == 0) {
            return fillProjectsData(dataProvider).then((id: number) => {
                return fillTasksData(dataProvider, id)
            }).then(() => {
                return fillTaskRelations(dataProvider)
            }).then(() => {
                const persistance = new graph.GraphPersistence(dataProvider)
                return persistance.loadGraph(1).then(() => {
                    return persistance.loadData()
                }).then(() => {
                    graph.compute(persistance.root)
                    return persistance.save()
                })
            })
        }
    })
}
