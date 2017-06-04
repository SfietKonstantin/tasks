import {Identifiable} from "../identifiable"
import {Feature} from "../feature"
import {InputError} from "../errors/input"

export interface ApiFeature extends Identifiable {
    name: string
    description: string
    color: string
}

export class FeatureBuilder {
    static fromObject(input: any): Feature {
        if (!input.hasOwnProperty("identifier")) {
            throw new InputError("Property \"identifier\" cannot be found")
        }
        if (!input.hasOwnProperty("name")) {
            throw new InputError("Property \"name\" cannot be found")
        }
        if (!input.hasOwnProperty("description")) {
            throw new InputError("Property \"description\" cannot be found")
        }
        if (!input.hasOwnProperty("color")) {
            throw new InputError("Property \"color\" cannot be found")
        }
        const identifier = input["identifier"]
        if (typeof identifier !== "string") {
            throw new InputError("Property \"identifier\" should be a string")
        }
        const name = input["name"]
        if (typeof name !== "string") {
            throw new InputError("Property \"name\" should be a string")
        }
        const description = input["description"]
        if (typeof description !== "string") {
            throw new InputError("Property \"description\" should be a string")
        }
        const color = input["color"]
        if (typeof color !== "string") {
            throw new InputError("Property \"color\" should be a string")
        }

        return {
            identifier,
            name,
            description,
            color,
            visible: true
        }
    }

    static toApiFeature(feature: Feature): ApiFeature {
        return {
            identifier: feature.identifier,
            name: feature.name,
            description: feature.description,
            color: feature.color
        }
    }

    static fromApiFeature(feature: ApiFeature): Feature {
        return {
            identifier: feature.identifier,
            name: feature.name,
            description: feature.description,
            color: feature.color,
            visible: true
        }
    }
}
