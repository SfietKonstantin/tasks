import {DelayDefinition} from "../../common/delay"

export interface IDelayDao {
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<DelayDefinition>
    getProjectDelays(projectIdentifier: string): Promise<Array<DelayDefinition>>
    addDelay(projectIdentifier: string, delay: DelayDefinition): Promise<void>
}