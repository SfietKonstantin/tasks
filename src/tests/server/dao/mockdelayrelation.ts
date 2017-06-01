import {IDelayRelationDao} from "../../../server/dao/idelayrelation"
import {DelayRelation} from "../../../common/old/delayrelation"

export class MockDelayRelationDao implements IDelayRelationDao {
    addDelayRelation(projectIdentifier: string, relation: DelayRelation): Promise<void> {
        throw new Error("MockDelayRelationDao: addDelayRelation is not mocked")
    }

    getDelayRelations(projectIdentifier: string, delayIdentifier: string): Promise<Array<DelayRelation>> {
        throw new Error("MockDelayRelationDao: getDelayRelations is not mocked")
    }
}

