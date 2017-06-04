import {DaoErrorUtils} from "../../dao/error/utils"

export class ApiErrorUtils {
    static isKnownError(error: Error): boolean {
        return DaoErrorUtils.isKnownError(error)
    }
}
