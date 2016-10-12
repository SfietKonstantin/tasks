import { IDataProvider } from "./idataprovider"

export interface IRedisDataProvider extends IDataProvider {
    watchTasksModifiers(identifiers: Array<string>): Promise<void>
    watchModifiersDurations(identifiers: Array<string>): Promise<void>
}
