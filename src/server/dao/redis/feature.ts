import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {NotFoundError} from "../../../common/errors/notfound"
import {wrapUnknownErrors} from "./utils/error"
import {ExistsError} from "../../error/exists"
import {Feature} from "../../../common/feature"
import {IFeatureDao} from "../ifeature"
import {BooleanBuilder} from "./utils/boolean"
bluebird.promisifyAll(redis)

class RedisFeature {
    readonly name: string
    readonly description: string
    readonly color: string
    readonly visible: string

    constructor(feature: Feature) {
        this.name = feature.name
        this.description = feature.description
        this.color = feature.color
        this.visible = BooleanBuilder.toString(feature.visible)
    }

    static save(feature: Feature, client: redisasync.RedisAsyncClient): Promise<void> {
        const redisFeature = new RedisFeature(feature)
        const featureIdentifier = feature.identifier
        const featureKey = KeyFactory.createFeatureKey(featureIdentifier)
        return client.hmsetAsync(featureKey, redisFeature).then(() => {
            const featureIdsKey = KeyFactory.createGlobalFeatureKey("ids")
            return client.saddAsync(featureIdsKey, featureIdentifier)
        })
    }

    static load(featureIdentifier: string, client: redisasync.RedisAsyncClient): Promise<Feature> {
        const featureKey = KeyFactory.createFeatureKey(featureIdentifier)
        return client.hgetallAsync(featureKey).then((result: any): Feature => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`Feature ${featureIdentifier} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`Feature ${featureIdentifier} do not have property "description"`)
            }
            if (!result.hasOwnProperty("color")) {
                throw new CorruptedError(`Feature ${featureIdentifier} do not have property "color"`)
            }
            if (!result.hasOwnProperty("visible")) {
                throw new CorruptedError(`Feature ${featureIdentifier} do not have property "visible"`)
            }
            const visible = BooleanBuilder.fromString(result["visible"])
            if (visible == null) {
                throw new CorruptedError(`Feature ${featureIdentifier} has an invalid "visible"`)
            }
            return {
                identifier: featureIdentifier,
                name: result["name"] as string,
                description: result["description"] as string,
                color: result["color"] as string,
                visible: visible
            }
        })
    }
}

export class RedisFeatureDao implements IFeatureDao {
    private readonly client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    getAllFeatures(): Promise<Array<Feature>> {
        const featureIdsKey = KeyFactory.createGlobalFeatureKey("ids")
        return this.client.smembersAsync(featureIdsKey).then((identifiers: Array<String>) => {
            const sortedIdentifiers = identifiers.sort()
            return Promise.all(sortedIdentifiers.map((identifier: string) => {
                return this.getFeature(identifier).catch(() => {
                    return null
                })
            }))
        }).then((features: Array<Feature | null>) => {
            return features.filter((feature: Feature | null) => {
                return feature && feature.visible
            })
        }).catch(() => {
            return []
        })
    }

    getFeature(featureIdentifier: string): Promise<Feature> {
        return this.hasFeature(featureIdentifier).then(() => {
            return RedisFeature.load(featureIdentifier, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    addFeature(feature: Feature): Promise<void> {
        return this.notHasFeature(feature.identifier).then(() => {
            return RedisFeature.save(feature, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    removeFeature(featureIdentifier: string): Promise<void> {
        return this.getFeature(featureIdentifier).then((feature: Feature) => {
            feature.visible = false
            return RedisFeature.save(feature, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    hasFeature(featureIdentifier: string): Promise<void> {
        const featureKey = KeyFactory.createFeatureKey(featureIdentifier)
        return this.client.existsAsync(featureKey).then((result: number) => {
            if (result !== 1) {
                throw new NotFoundError(`Feature ${featureIdentifier} not found`)
            }
        })
    }

    private notHasFeature(featureIdentifier: string): Promise<void> {
        const featureKey = KeyFactory.createFeatureKey(featureIdentifier)
        return this.client.existsAsync(featureKey).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Feature ${featureIdentifier} already exists`)
            }
        })
    }
}
