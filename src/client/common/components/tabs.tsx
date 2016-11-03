import * as React from "react"
import * as ReactDOM from "react-dom"
import {Col, Nav, NavItem} from "react-bootstrap"

interface TabBarProperties {
    tabs: Array<String>
    tabChangedCallback: (index: number) => void
}

interface TabBarState {
    currentTab: number
}

export class TabBar extends React.Component<TabBarProperties, TabBarState> {
    constructor(props: TabBarProperties) {
        super(props)
        this.state = { currentTab: 0 }
    }
    render() {
        let tabs = Array<JSX.Element>()
        for (let i = 0; i < this.props.tabs.length; ++i) {
            tabs.push(<NavItem eventKey={i} key={i}>{this.props.tabs[i]}</NavItem>)
        }
        return <Col id="page-header-tabs" xs={12} sm={8}>
            <Nav bsStyle="tabs" activeKey={this.state.currentTab}
                 className="page-header-nav" onSelect={this.handleClick.bind(this)}>
                {tabs}
            </Nav>
        </Col>
    }
    componentDidMount() {
        this.props.tabChangedCallback(this.state.currentTab)
    }
    private handleClick(index: number) {
        this.props.tabChangedCallback(index)
        this.setState({currentTab: index})
    }
}
