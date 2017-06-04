import {DaoErrorUtils} from "../../dao/error/utils"
import {GraphError} from "../../old/graph/error/graph"

export class ApiErrorUtils {
    static isKnownError(error: Error): boolean {
        return DaoErrorUtils.isKnownError(error) || error instanceof GraphError
    }
}
