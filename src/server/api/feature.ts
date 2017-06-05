import * as winston from "winston"
import {IDaoBuilder} from "../dao/ibuilder"
import {RequestError} from "../error/request"
import {ApiFeature, FeatureBuilder} from "../../common/api/feature"
import {ApiErrorUtils} from "./error/utils"
import {Feature} from "../../common/feature"
import {InputError} from "../../common/errors/input"
import {ExistsError} from "../error/exists"

export class FeatureApiProvider {
    private readonly daoBuilder: IDaoBuilder

    constructor(daoBuilder: IDaoBuilder) {
        this.daoBuilder = daoBuilder
    }

    getAllFeatures(): Promise<Array<ApiFeature>> {
        const featureDao = this.daoBuilder.buildFeatureDao()
        return featureDao.getAllFeatures().then((features: Array<Feature>) => {
            return features.map((feature: Feature) => {
                return FeatureBuilder.toApiFeature(feature)
            })
        }).catch((error: Error) => {
            if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }

    addFeature(feature: any): Promise<void> {
        return Promise.resolve().then(() => {
            const featureDao = this.daoBuilder.buildFeatureDao()
            const inputFeature = FeatureBuilder.fromObject(feature)
            return featureDao.addFeature(inputFeature)
        }).catch((error: Error) => {
            if (error instanceof InputError || error instanceof ExistsError) {
                winston.debug(error.message)
                throw new RequestError(400, "Invalid input for addFeature")
            } else if (ApiErrorUtils.isKnownError(error)) {
                winston.error(error.message)
                throw new RequestError(500, "Internal error")
            } else {
                throw error
            }
        })
    }
}
