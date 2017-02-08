import {InternalError} from "../../error/internal"
import {DaoErrorUtils} from "../../error/utils"

export const wrapUnknownErrors = (error: Error) => {
    if (!DaoErrorUtils.isKnownError(error)) {
        throw new InternalError(error.message)
    } else {
        throw error
    }
}
