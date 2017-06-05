import * as chai from "chai"
import {ApiFeature, FeatureBuilder} from "../../../common/api/feature"
import {Feature} from "../../../common/feature"
import {InputError} from "../../../common/errors/input"

describe("API FeatureBuilder", () => {
    const apiFeature: ApiFeature = {
        identifier: "feature",
        name: "Feature",
        description: "Description",
        color: "red"
    }
    const feature: Feature = {
        identifier: "feature",
        name: "Feature",
        description: "Description",
        color: "red",
        visible: true
    }
    const invisibleFeature: Feature = {
        identifier: "feature",
        name: "Feature",
        description: "Description",
        color: "red",
        visible: false
    }
    it("Should create a feature from correct input", () => {
        chai.expect(FeatureBuilder.fromObject(apiFeature)).to.deep.equal(feature)
    })
    it("Should not create a feature from an input without identifier", () => {
        const feature = {
            name: "Feature",
            description: "Description",
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input with wrong identifier type", () => {
        const feature = {
            identifier: {test: "test"},
            name: "Feature",
            description: "Description",
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input without name", () => {
        const feature = {
            identifier: "feature",
            description: "Description",
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input with wrong name type", () => {
        const feature = {
            identifier: "feature",
            name: {test: "test"},
            description: "Description",
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input without description", () => {
        const feature = {
            identifier: "feature",
            name: "Feature",
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input with wrong description type", () => {
        const feature = {
            identifier: "feature",
            name: "Feature",
            description: {test: "test"},
            color: "red"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input without color", () => {
        const feature = {
            identifier: "feature",
            name: "Feature",
            description: "Description"
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should not create a feature from an input with wrong color type", () => {
        const feature = {
            identifier: "feature",
            name: "Feature",
            description: "Description",
            color: {test: "test"}
        }
        chai.expect(() => {
            FeatureBuilder.fromObject(feature)
        }).to.throw(InputError)
    })
    it("Should convert a Feature to an API Feature", () => {
        chai.expect(FeatureBuilder.toApiFeature(feature)).to.deep.equal(apiFeature)
        chai.expect(FeatureBuilder.toApiFeature(invisibleFeature)).to.deep.equal(apiFeature)
    })
    it("Should convert an API Feature to a Feature", () => {
        chai.expect(FeatureBuilder.fromApiFeature(apiFeature)).to.deep.equal(feature)
    })
})
