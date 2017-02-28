import * as chai from "chai"
import * as sinon from "sinon"
import * as React from "react"
import * as enzyme from "enzyme"
import "isomorphic-fetch"
import {Main} from "../../../client/index/main"
import {project1, project2} from "../../common/testdata"
import {Card} from "semantic-ui-react"
import {addMockWindow, removeMockWindow} from "../utils/mockwindow"

describe("Client index main", () => {
    let sandbox: sinon.SinonSandbox
    beforeEach(() => {
        addMockWindow()
        sandbox = sinon.sandbox.create()
    })
    afterEach(() => {
        removeMockWindow()
        sandbox.restore()
    })
    it("Should retrieve the list of projects when mounted", (done) => {
        let mockFetch = sandbox.mock(window).expects("fetch")
        const results = new Response(JSON.stringify([project1, project2]), {status: 200})
        const resultsPromise = Promise.resolve(results)
        mockFetch.once().withExactArgs("/api/project/list").returns(resultsPromise)

        const component = enzyme.mount(<Main />)

        resultsPromise.then(() => {
            chai.expect(component.state()).to.deep.equal({
                isFetching: true,
                projects: []
            })
            process.nextTick(() => {
                chai.expect(component.state()).to.deep.equal({
                    isFetching: false,
                    projects: [project1, project2]
                })
                done()
            })
        })
    })
    it("Should render the projects", () => {
        const component = enzyme.shallow(<Main />)
        component.setState({
            isFetching: false,
            projects: [project1, project2]
        })
        component.update()
        const cardGroup = component.find(Card.Group)
        chai.expect(cardGroup).to.length(1)
        chai.expect(cardGroup.prop("items")).to.deep.equal([
            {
                header: project1.name,
                meta: `#${project1.identifier}`,
                description: project1.description,
                href: `/project/${project1.identifier}`
            },
            {
                header: project2.name,
                meta: `#${project2.identifier}`,
                description: project2.description,
                href: `/project/${project2.identifier}`
            }
        ])
    })
})
