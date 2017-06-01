import {TaskRelation} from "../../common/old/taskrelation"

export interface ITaskRelationDao {
    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void>
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>>
}
