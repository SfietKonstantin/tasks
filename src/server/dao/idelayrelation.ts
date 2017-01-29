import {DelayRelation} from "../../common/delayrelation"

export interface IDelayRelationDao {
    addDelayRelation(projectIdentifier: string, relation: DelayRelation): Promise<void>
    getDelayRelations(projectIdentifier: string, delayIdentifier: string): Promise<Array<DelayRelation>>
}
