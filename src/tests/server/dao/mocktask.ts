import {ITaskDao} from "../../../server/dao/itask"
import {TaskDefinition} from "../../../common/old/task"

export class MockTaskDao implements ITaskDao {
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<TaskDefinition> {
        throw new Error("MockTaskDao: getTask is not mocked")
    }

    getProjectTasks(projectIdentifier: string): Promise<Array<TaskDefinition>> {
        throw new Error("MockTaskDao: getProjectTasks is not mocked")
    }

    addTask(projectIdentifier: string, task: TaskDefinition): Promise<void> {
        throw new Error("MockTaskDao: addTask is not mocked")
    }

    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        throw new Error("MockTaskDao: isTaskImportant is not mocked")
    }

    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void> {
        throw new Error("MockTaskDao: setTaskImportant is not mocked")
    }
}
