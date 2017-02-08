import {IProjectDao} from "./iproject"
import {ITaskDao} from "./itask"
import {IDelayDao} from "./idelay"
import {ITaskRelationDao} from "./itaskrelation"
import {IDelayRelationDao} from "./idelayrelation"
import {IModifierDao} from "./imodifier"

export interface IDaoBuilder {
    stop(): void
    buildProjectDao(): IProjectDao
    buildTaskDao(): ITaskDao
    buildDelayDao(): IDelayDao
    buildTaskRelationDao(): ITaskRelationDao
    buildDelayRelationDao(): IDelayRelationDao
    buildModifierDao(): IModifierDao
}
