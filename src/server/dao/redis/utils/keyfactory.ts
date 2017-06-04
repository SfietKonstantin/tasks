export class KeyFactory {
    static createGlobalFeatureKey(property: string) {
        return `tm:feature:${property}`
    }

    static createFeatureKey(featureIdentifier: string, property?: string) {
        if (property) {
            return `tm:feature:${featureIdentifier}:${property}`
        } else {
            return `tm:feature:${featureIdentifier}`
        }
    }

    static createGlobalStoryKey(property: string) {
        return `tm:story:${property}`
    }

    static createStoryKey(storyIdentifier: string, property?: string) {
        if (property) {
            return `tm:story:${storyIdentifier}:${property}`
        } else {
            return `tm:story:${storyIdentifier}`
        }
    }
}
