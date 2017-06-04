import {Modifier} from "../../../common/old/modifier"

export interface IModifierDao {
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier>
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>>
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number>
    addModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void>
}
