import {Feature} from "../../common/feature"

export interface IFeatureDao {
    getAllFeatures(): Promise<Array<Feature>>
    getFeature(featureIdentifier: string): Promise<Feature>
    addFeature(feature: Feature): Promise<void>
    removeFeature(featureIdentifier: string): Promise<void>
}
