import * as React from "react"
import {Project} from "../../common/old/project"
import {Card} from "semantic-ui-react"
import {processFetch} from "../common/utils/fetch"

interface MainState {
    isFetching: boolean
    projects: Array<Project>
}

export class Main extends React.Component<{}, MainState> {
    constructor() {
        super()
        this.state = {
            isFetching: false,
            projects: []
        }
    }
    render() {
        const items = this.state.projects.map((project: Project) => {
            return {
                header: project.name,
                meta: `#${project.identifier}`,
                description: project.description,
                href: `/project/${project.identifier}`
            }
        })

        return <div className="ui main container" >
            <h1 className="ui header">Active projects</h1>
            <Card.Group items={items} />
        </div>
    }
    componentDidMount() {
        this.setState({
            isFetching: true,
            projects: []
        })

        window.fetch("/api/project/list").then((response: Response) => {
            return processFetch<Array<Project>>(response)
        }).then((projects: Array<Project>) => {
            this.setState({
                isFetching: false,
                projects
            })
        })
    }
}
