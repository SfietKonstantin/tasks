import {IFeatureDao} from "./ifeature"
import {IStoryDao} from "./istory"

export interface IDaoBuilder {
    stop(): void
    buildFeatureDao(): IFeatureDao
    buildStoryDao(): IStoryDao
}
