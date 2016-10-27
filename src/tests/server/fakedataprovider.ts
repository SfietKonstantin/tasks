import { IDataProvider } from "../../server/core/data/idataprovider"
import { Project, Task, TaskResults, TaskRelation, Modifier, Delay } from "../../common/types"

export class FakeDataProvider implements IDataProvider {
    getAllProjects(): Promise<Array<Project>> {
        return Promise.reject(new Error("Not mocked"))
    }
    getProject(projectIdentifier: string): Promise<Project> {
        return Promise.reject(new Error("Not mocked"))
    }
    addProject(project: Project): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    hasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<Task> {
        return Promise.reject(new Error("Not mocked"))
    }
    getProjectTasks(projectIdentifier: string): Promise<Array<Task>> {
        return Promise.reject(new Error("Not mocked"))
    }
    addTask(projectIdentifier: string, task: Task): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    getParentTaskIdentifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<string>> {
        return Promise.reject(new Error("Not mocked"))
    }
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        return Promise.reject(new Error("Not mocked"))
    }
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>> {
        return Promise.reject(new Error("Not mocked"))
    }
    getTaskResults(projectIdentifier: string, taskIdentifier: string): Promise<TaskResults> {
        return Promise.reject(new Error("Not mocked"))
    }
    setTaskResults(projectIdentifier: string, taskIdentifier: string, taskResults: TaskResults): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier> {
        return Promise.reject(new Error("Not mocked"))
    }
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>> {
        return Promise.reject(new Error("Not mocked"))
    }
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number> {
        return Promise.reject(new Error("Not mocked"))
    }
    setModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay> {
        return Promise.reject(new Error("Not mocked"))
    }
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>> {
        return Promise.reject(new Error("Not mocked"))
    }
    addDelay(projectIdentifier: string, delay: Delay): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
    addDelayTaskRelation(projectIdentifier: string, delayIdentifier: string, taskIdentifier: string): Promise<void> {
        return Promise.reject(new Error("Not mocked"))
    }
}
