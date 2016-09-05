import { IDataProvider } from "./idataprovider"
import { Project, Task } from "./types"

export class BasicDataProvider implements IDataProvider {
    constructor() {
        this.projects = new Array<Project>()

        let project = new Project()
        project.id = 1
        project.name = "Test project"
        project.description = "Test project description"
        this.projects.push(project)

        this.tasks = new Array<Task>()

        let task1 = new Task()
        task1.id = 1
        task1.project_id = 1
        task1.name = "Task 1"
        task1.description = "Task 1 description"
        this.tasks.push(task1)

        let task2 = new Task()
        task2.id = 2
        task2.project_id = 1
        task2.name = "Task 2"
        task2.description = "Task 2 description"
        this.tasks.push(task2)
    }
    getProjectList() : Array<Project> {
        return this.projects
    }
    getProject(id: number) : Project {
        let projects = this.projects.filter(function (value: Project) : boolean {
            return value.id == id
        })
        if (projects.length == 1) {
            return projects[0]
        } else {
            return null
        }
    }
    getProjectTaskList(id: number) : Array<Task> {
        let tasks = this.tasks.filter(function (value: Task) : boolean {
            return value.project_id == id
        })
        return tasks
    }
    getTask(id: number) : Task {
        let tasks = this.tasks.filter(function (value: Task) : boolean {
            return value.id == id
        })
        if (tasks.length == 1) {
            return tasks[0]
        } else {
            return null
        }
    }
    private projects: Array<Project>
    private tasks:  Array<Task>
}
