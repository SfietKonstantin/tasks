import {IDelayDao} from "../../../server/dao/idelay"
import {DelayDefinition} from "../../../common/delay"

export class MockDelayDao implements IDelayDao {
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<DelayDefinition> {
        throw new Error("MockDelayDao: getDelay is not mocked")
    }

    getProjectDelays(projectIdentifier: string): Promise<Array<DelayDefinition>> {
        throw new Error("MockDelayDao: getProjectDelays is not mocked")
    }

    addDelay(projectIdentifier: string, delay: DelayDefinition): Promise<void> {
        throw new Error("MockDelayDao: addDelay is not mocked")
    }
}
