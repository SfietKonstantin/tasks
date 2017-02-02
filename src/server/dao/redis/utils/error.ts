import {ExistsError} from "../../../error/exists"
import {NotFoundError} from "../../../../common/errors/notfound"
import {InputError} from "../../../../common/errors/input"
import {CorruptedError} from "../../error/corrupted"
import {InternalError} from "../../error/internal"

const isKnownError = (error: Error): boolean => {
    return error instanceof ExistsError
        || error instanceof NotFoundError
        || error instanceof InputError
        || error instanceof CorruptedError
        || error instanceof InternalError
}

export const wrapUnknownErrors = (error: Error) => {
    if (!isKnownError(error)) {
        throw new InternalError(error.message)
    } else {
        throw error
    }
}
