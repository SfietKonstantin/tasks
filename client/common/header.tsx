import * as React from "react";
import * as ReactDOM from "react-dom";

interface HeaderProperties {
    id: number
    name: string
    content?: JSX.Element
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        return <div className="page-header navbar-default">
            <div className="container page-header-container">
                <div className="col-xs-11 col-md-8">
                    <h1>{this.props.name} <small>#{+this.props.id}</small></h1>
                </div>
                {this.props.children}
            </div>
        </div>
    }
}