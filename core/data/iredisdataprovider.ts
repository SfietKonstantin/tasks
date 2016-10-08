import { IDataProvider } from "./idataprovider"

export interface IRedisDataProvider extends IDataProvider {
    watchTasksImpacts(identifiers: Array<string>) : Promise<void>
    watchImpactsDurations(identifiers: Array<string>) : Promise<void>
} 