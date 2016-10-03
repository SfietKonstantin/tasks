import * as React from "react";
import * as ReactDOM from "react-dom";

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
            let label = this.props.tabs[i]
            let className = (i == this.state.currentTab ? "active" : "")
            tabs.push(
                <li role="presentation" className={className}>
                    <a href="#" onClick={this.handleClick.bind(this, i)}>{label}</a>
                </li>
            )
        }
        return <div id="page-header-tabs" className="col-xs-12 col-md-8">
            <ul className="page-header-nav nav nav-tabs">
                {tabs}
            </ul>
        </div>
    }
    componentDidMount() {
        this.props.tabChangedCallback(this.state.currentTab)
    }
    private handleClick(index: number, e: React.MouseEvent) {
        e.preventDefault()
        this.props.tabChangedCallback(index)
        this.setState({currentTab: index})
    }
}
