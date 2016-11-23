import { IDataProvider } from "../../server/core/data/idataprovider"
import { Project, TaskDefinition, TaskRelation, Modifier, DelayDefinition, DelayRelation } from "../../common/types"

export class FakeDataProvider implements IDataProvider {
    getAllProjects(): Promise<Array<Project>> {
        return Promise.reject(new Error("FakeDataProvider: getAllProjects is not mocked"))
    }
    getProject(projectIdentifier: string): Promise<Project> {
        return Promise.reject(new Error("FakeDataProvider: getProject is not mocked"))
    }
    addProject(project: Project): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addProject is not mocked"))
    }
    hasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: hasTask is not mocked"))
    }
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<TaskDefinition> {
        return Promise.reject(new Error("FakeDataProvider: getTask is not mocked"))
    }
    getProjectTasks(projectIdentifier: string): Promise<Array<TaskDefinition>> {
        return Promise.reject(new Error("FakeDataProvider: getProjectTasks is not mocked"))
    }
    addTask(projectIdentifier: string, task: TaskDefinition): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addTask is not mocked"))
    }
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        return Promise.reject(new Error("FakeDataProvider: isTaskImportant is not mocked"))
    }
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: setTaskImportant is not mocked"))
    }
    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addTaskRelation is not mocked"))
    }
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>> {
        return Promise.reject(new Error("FakeDataProvider: getTaskRelations is not mocked"))
    }
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier> {
        return Promise.reject(new Error("FakeDataProvider: getModifier is not mocked"))
    }
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>> {
        return Promise.reject(new Error("FakeDataProvider: getTaskModifiers is not mocked"))
    }
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number> {
        return Promise.reject(new Error("FakeDataProvider: addModifier is not mocked"))
    }
    addModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addModifierForTask is not mocked"))
    }
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<DelayDefinition> {
        return Promise.reject(new Error("FakeDataProvider: getDelay is not mocked"))
    }
    getProjectDelays(projectIdentifier: string): Promise<Array<DelayDefinition>> {
        return Promise.reject(new Error("FakeDataProvider: getProjectDelays is not mocked"))
    }
    addDelay(projectIdentifier: string, delay: DelayDefinition): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addDelay is not mocked"))
    }
    addDelayRelation(projectIdentifier: string, delay: DelayRelation): Promise<void> {
        return Promise.reject(new Error("FakeDataProvider: addDelayRelation is not mocked"))
    }
    getDelayRelations(projectIdentifier: string, delayIdentifier: string): Promise<Array<DelayRelation>> {
        return Promise.reject(new Error("FakeDataProvider: getDelayRelations is not mocked"))
    }
}
