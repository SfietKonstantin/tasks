import { IDataProvider } from "./idataprovider"
import { Project, Task } from "./types"
import { TaskNode } from "./graph"

class ProjectData {
    project: Project
    tasks: Array<Task>
    root: TaskNode
    constructor() {
        this.tasks = new Array<Task>()
    }
}

export class BasicDataProvider implements IDataProvider {
    private projects: Map<number, ProjectData>
    private nodes: Map<number, TaskNode>
    constructor() {
        this.projects = new Map<number, ProjectData>()
        this.nodes = new Map<number, TaskNode>()

        let project = new Project(1)
        project.name = "Test project"
        project.description = "Test project description"
        let projectData = this.addProject(project)

        let task1 = new Task(1, 1)
        task1.name = "Root task"
        task1.description = "Project beginning"
        task1.estimatedStartDate = new Date(2015, 9, 1)
        task1.estimatedDuration = 31
        let node1 = this.addTaskNode(task1)
        projectData.tasks.push(task1)
        projectData.root = node1

        let task2 = new Task(2, 1)
        task2.name = "Long task"
        task2.description = "Some long task"
        task2.estimatedStartDate = new Date(2015, 10, 1)
        task2.estimatedDuration = 60
        let node2 = this.addTaskNode(task2)
        node1.addChild(node2)
        projectData.tasks.push(task2)

        let task3 = new Task(2, 1)
        task3.name = "Short task"
        task3.description = "Some short task"
        task3.estimatedStartDate = new Date(2015, 10, 1)
        task3.estimatedDuration = 31
        let node3 = this.addTaskNode(task3)
        node1.addChild(node3)
        projectData.tasks.push(task3)

        let task4 = new Task(2, 1)
        task4.name = "Reducing task"
        task4.description = "Task depending on two tasks"
        task4.estimatedStartDate = new Date(2015, 12, 1)
        task4.estimatedDuration = 30
        let node4 = this.addTaskNode(task4)
        node2.addChild(node4)
        node3.addChild(node4)
        projectData.tasks.push(task4)

        node1.recompute()
    }
    getProjectList() : Array<Project> {
        return Array.from(this.projects.values()).map((value: ProjectData) => {
            return value.project
        })
    }
    getProject(id: number) : Project {
        return this.projects.has(id) ? this.projects.get(id).project : null
    }
    getProjectTaskList(id: number) : Array<Task> {
        return this.projects.has(id) ? this.projects.get(id).tasks : null
    }
    getProjectRootNode(id: number) : TaskNode {
        return this.projects.has(id) ? this.projects.get(id).root : null
    }
    getNode(id: number) : TaskNode {
        return this.nodes.has(id) ? this.nodes.get(id) : null
    }
    private addProject(project: Project) : ProjectData {
        let projectData = new ProjectData()
        projectData.project = project
        this.projects.set(project.id, projectData)
        return projectData
    }
    private addTaskNode(task: Task) : TaskNode {
        let node = new TaskNode(task)
        this.nodes.set(task.id, node)
        this.projects.get(task.projectId).tasks.push(task)
        return node
    }
}
