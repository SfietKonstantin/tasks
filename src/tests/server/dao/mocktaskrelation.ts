import {ITaskRelationDao} from "../../../server/dao/itaskrelation"
import {TaskRelation} from "../../../common/old/taskrelation"

export class MockTaskRelationDao implements ITaskRelationDao {
    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void> {
        throw new Error("MockTaskRelationDao: addTaskRelation is not mocked")
    }

    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>> {
        throw new Error("MockTaskRelationDao: getTaskRelations is not mocked")
    }
}

