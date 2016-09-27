import { IDataProvider } from "./idataprovider"

export interface IRedisDataProvider extends IDataProvider {
    watchTasksImpacts(ids: Array<number>) : Promise<void>
    watchImpactsDurations(id: Array<number>) : Promise<void>
} 