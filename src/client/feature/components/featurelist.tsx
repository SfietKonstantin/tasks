import * as React from "react"
import {ApiFeature} from "../../../common/api/feature"
import {Grid, Col, Glyphicon, ListGroup, ListGroupItem} from "react-bootstrap"
import {FeatureButton} from "./featurebutton"

interface FeatureListProperties {
    features: Array<ApiFeature>
    onAddFeature: (feature: ApiFeature) => void
}

export class FeatureList extends React.Component<FeatureListProperties, {}> {
    render() {
        const items = this.props.features.map((feature: ApiFeature) => {
            const style = {
                background: feature.color
            }
            return <ListGroupItem id={feature.identifier}>
                <span className="color-indicator" style={style}/>
                <a className="identifier-indicator" href="#">{feature.identifier.toUpperCase()}</a>{feature.name}
            </ListGroupItem>
        })
        return <Grid>
            <Col xs={12} md={8}>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <FeatureButton onAddFeature={this.props.onAddFeature}>
                            <Glyphicon glyph="plus" /> Add feature
                        </FeatureButton>
                    </div>
                    <ListGroup fill>
                        {items}
                    </ListGroup>
                </div>
            </Col>
            <Col md={4} xsHidden={true} smHidden={true}/>
        </Grid>
    }
}
