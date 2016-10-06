import * as React from "react"
import * as jquery from "jquery"
import { Project } from "../../core/types"

interface ProjectMainProperties {
    project: Project
}

export class ProjectMain extends React.Component<ProjectMainProperties, {}> {
    render() {
        return <div className="container">
            <div id="main" className="col-xs-12 col-md-10">
                <h2>Overview</h2>
                <p>(Under construction)</p>
            </div>
        </div>
    }
} 
