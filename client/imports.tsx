import * as React from "react"
import * as ReactDOM from "react-dom"
import { Primavera } from "./imports/primavera/primavera"

class ImportsComponentProperties {
    source: string
}

class ImportsComponent extends React.Component<ImportsComponentProperties, {}> {
    constructor(props: ImportsComponentProperties) {
        super(props)
    }
    render() {
        if (this.props.source == "primavera") {
            return <Primavera /> 
        }
        return <div></div>
    }
}

export function render(source: string) {
    ReactDOM.render(<ImportsComponent source={source} />, document.getElementById("content"))
}