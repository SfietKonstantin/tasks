import { IDataProvider } from "./data/idataprovider"
import { Project, Task } from "./types"
import * as async from "async"

function fillProjectsData(dataProvider: IDataProvider) : Promise<number> {
    let project = new Project(1)
    project.name = "Test project"
    project.description = "Test project description"
    return dataProvider.addProject(project)
}

function fillTasksData(dataProvider: IDataProvider, projectId: number) : Promise<void> {
    let tasks = new Array<Task>();
                
    let task1 = new Task(null, null)
    task1.name = "Root task"
    task1.description = "Project beginning"
    task1.estimatedStartDate = new Date(2015, 9, 1)
    task1.estimatedDuration = 31
    tasks.push(task1)

    let task2 = new Task(null, null)
    task2.name = "Long task"
    task2.description = "Some long task"
    task2.estimatedStartDate = new Date(2015, 10, 1)
    task2.estimatedDuration = 60
    tasks.push(task2)

    let task3 = new Task(null, null)
    task3.name = "Short task"
    task3.description = "Some short task"
    task3.estimatedStartDate = new Date(2015, 10, 1)
    task3.estimatedDuration = 31
    tasks.push(task3)

    let task4 = new Task(null, null)
    task4.name = "Reducing task"
    task4.description = "Task depending on two tasks"
    task4.estimatedStartDate = new Date(2015, 12, 1)
    task4.estimatedDuration = 30
    tasks.push(task4)

    return new Promise<void>((resolve, reject) => {
        async.map(tasks, (task: Task, callback: (error: Error, id: number) => void) => {
            dataProvider.addTask(projectId, task).then((id: number) => {
                callback(null, id)
            }).catch((error: Error) => {
                callback(error, null)
            })
        }, (error: Error, result: Array<number>) => {
            if (error) {
                reject(error)
            } else {
                resolve()
            }
        })
    })
}

function fillTaskRelations(dataProvider: IDataProvider) : Promise<void> {
    return dataProvider.setTaskRelation(1, 2).then(() => {
        return dataProvider.setTaskRelation(1, 3).then(() => {
            return dataProvider.setTaskRelation(2, 4).then(() => {
                return dataProvider.setTaskRelation(3, 4)
            })
        })
    })
}

export function fillTestData(dataProvider: IDataProvider) {
    dataProvider.getAllProjects().then((projects: Array<Project>) => {
        if (projects.length == 0) {
            return fillProjectsData(dataProvider).then((id: number) => {
                return fillTasksData(dataProvider, id).then(() => {
                    return fillTaskRelations(dataProvider)
                })
            })
        }
    })
}
