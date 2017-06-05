import * as React from "react"
import {ApiFeature} from "../../common/api/feature"
import {processFetch} from "../common/utils/fetch"
import {FeatureList} from "./components/featurelist"

interface MainState {
    isFetching: boolean
    features: Array<ApiFeature>
}

export class Main extends React.Component<{}, MainState> {
    constructor() {
        super()
        this.state = {
            isFetching: false,
            features: []
        }
    }

    render() {
        return <FeatureList features={this.state.features} onAddFeature={this.onAddFeature.bind(this)}/>
    }

    componentDidMount() {
        this.setState({
            isFetching: true,
            features: []
        })

        return this.load()
    }

    private onAddFeature(feature: ApiFeature) {
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(feature)
        }

        this.setState({
            ...this.state,
            isFetching: true
        })

        window.fetch("/api/feature", requestInit).then(() => {
            return this.load()
        })
    }

    private load(): Promise<void> {
        return window.fetch("/api/feature/list").then((response: Response) => {
            return processFetch<Array<ApiFeature>>(response)
        }).then((features: Array<ApiFeature>) => {
            this.setState({
                ...this.state,
                isFetching: false,
                features
            })
        })
    }
}
