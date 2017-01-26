import {IProjectDao} from "./iproject"
import {ITaskDao} from "./itask";

export interface IDaoBuilder {
    buildProjectDao(): IProjectDao
    buildTaskDao(): ITaskDao
}
