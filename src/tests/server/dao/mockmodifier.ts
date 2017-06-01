import {IModifierDao} from "../../../server/dao/imodifier"
import {Modifier} from "../../../common/old/modifier"

export class MockModifierDao implements IModifierDao {
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier> {
        throw new Error("MockModifierDao: addTaskRelation is not mocked")
    }

    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>> {
        throw new Error("MockModifierDao: getTaskModifiers is not mocked")
    }

    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number> {
        throw new Error("MockModifierDao: addModifier is not mocked")
    }

    addModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void> {
        throw new Error("MockModifierDao: addModifierForTask is not mocked")
    }
}

