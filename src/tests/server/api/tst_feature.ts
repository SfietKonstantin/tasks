import * as chai from "chai"
import {FeatureApiProvider} from "../../../server/api/feature"
import {ApiFeature, FeatureBuilder} from "../../../common/api/feature"
import {feature1, feature2, feature3} from "../../common/testdata"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../server/error/request"
import {InternalError} from "../../../server/dao/error/internal"
import {InputError} from "../../../common/errors/input"
import {ExistsError} from "../../../server/error/exists"
import {FakeError} from "./fakeerror"

describe("API Feature", () => {
    let daoBuilder: MockDaoBuilder
    let apiProvider: FeatureApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        apiProvider = new FeatureApiProvider(daoBuilder)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("getAllFeatures", () => {
        it("Should get a list of features", () => {
            const expected: Array<ApiFeature> = [
                FeatureBuilder.toApiFeature(feature1),
                FeatureBuilder.toApiFeature(feature2)
            ]
            daoBuilder.mockFeatureDao.expects("getAllFeatures").once()
                .returns(Promise.resolve(expected))

            return apiProvider.getAllFeatures().then((stories: Array<ApiFeature>) => {
                chai.expect(stories).to.deep.equal(expected)
            })
        })
        it("Should get an exception on internal error", () => {
            daoBuilder.mockFeatureDao.expects("getAllFeatures").once()
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getAllFeatures().then(() => {
                throw new Error("getAllFeatures should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        it("Should get an exception on other error", () => {
            daoBuilder.mockFeatureDao.expects("getAllFeatures").once()
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getAllFeatures().then(() => {
                throw new Error("getAllFeatures should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
    describe("addFeature", () => {
        it("Should add a feature", () => {
            daoBuilder.mockFeatureDao.expects("addFeature").once().returns(Promise.resolve())

            return apiProvider.addFeature(FeatureBuilder.toApiFeature(feature3))
        })
    })
    it("Should get an exception on internal error", () => {
        daoBuilder.mockFeatureDao.expects("addFeature").once()
            .returns(Promise.reject(new InternalError("Some error")))

        return apiProvider.addFeature(FeatureBuilder.toApiFeature(feature3)).then(() => {
            throw new Error("addFeature should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(RequestError)
            chai.expect((error as RequestError).status).to.equal(500)
        })
    })
    it("Should get an exception on input error", () => {
        daoBuilder.mockFeatureDao.expects("addFeature").once()
            .returns(Promise.reject(new InputError("Some error")))

        return apiProvider.addFeature(FeatureBuilder.toApiFeature(feature3)).then(() => {
            throw new Error("addFeature should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(RequestError)
            chai.expect((error as RequestError).status).to.equal(400)
        })
    })
    it("Should get an exception on exists error", () => {
        daoBuilder.mockFeatureDao.expects("addFeature").once()
            .returns(Promise.reject(new ExistsError("Some error")))

        return apiProvider.addFeature(FeatureBuilder.toApiFeature(feature3)).then(() => {
            throw new Error("addFeature should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(RequestError)
            chai.expect((error as RequestError).status).to.equal(400)
        })
    })
    it("Should get an exception on other error", () => {
        daoBuilder.mockFeatureDao.expects("addFeature").once()
            .returns(Promise.reject(new FakeError("Some error")))

        return apiProvider.addFeature(FeatureBuilder.toApiFeature(feature3)).then(() => {
            throw new Error("addFeature should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(FakeError)
        })
    })
})
