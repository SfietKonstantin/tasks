import * as React from "react"
import { Dispatch } from "redux"
import { Grid, ListGroup, ListGroupItem } from "react-bootstrap"
import { Project } from "../../../common/types"
import { fetchProjects } from "../actions/project"
import { State } from "../types"

interface MainProperties {
    projects: Array<Project>
    onFetchProjects: () => void
}

export class Main extends React.Component<MainProperties, {}> {
    render() {
        const items = this.props.projects.map((project: Project) => {
            const href = "/project/" + project.identifier
            return <ListGroupItem href={href}>{project.name}</ListGroupItem>
        })
        return <Grid>
            <h2 className="title-h2">Projects</h2>
            <ListGroup className="tab-table" >
                {items}
            </ListGroup>
        </Grid>
    }
    componentDidMount() {
        this.props.onFetchProjects()
    }
}

export const mapStateToProps = (state: State) => {
    return {
        projects: state.project.projects
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFetchProjects: () => {
            dispatch(fetchProjects())
        },
    }
}
