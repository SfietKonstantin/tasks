import {ExistsError} from "../../error/exists"
import {NotFoundError} from "../../../common/errors/notfound"
import {InputError} from "../../../common/errors/input"
import {CorruptedError} from "./corrupted"
import {InternalError} from "./internal"

export class DaoErrorUtils {
    static isKnownError(error: Error): boolean {
        return error instanceof ExistsError
            || error instanceof NotFoundError
            || error instanceof InputError
            || error instanceof CorruptedError
            || error instanceof InternalError
    }
}
