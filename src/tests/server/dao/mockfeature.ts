import {IFeatureDao} from "../../../server/dao/ifeature"
import {Feature} from "../../../common/feature"

export class MockFeatureDao implements IFeatureDao {
    getAllFeatures(): Promise<Array<Feature>> {
        throw new Error("MockFeatureDao: getAllFeatures is not mocked")
    }

    getFeature(featureIdentifier: string): Promise<Feature> {
        throw new Error("MockFeatureDao: getFeature is not mocked")
    }

    addFeature(feature: Feature): Promise<void> {
        throw new Error("MockFeatureDao: addFeature is not mocked")
    }

    removeFeature(featureIdentifier: string): Promise<void> {
        throw new Error("MockFeatureDao: removeFeature is not mocked")
    }
}

