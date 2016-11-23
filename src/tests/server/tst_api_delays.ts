import * as chai from "chai"
import * as sinon from "sinon"
import { Project, DelayDefinition } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { ApiDelay } from "../../common/apitypes"
import { IDataProvider, CorruptedError, InternalError } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { ProjectNode, TaskNode, DelayNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph, FakeProjectNode, FakeDelayNode } from "./fakegraph"
import { FakeError } from "./fakeerror"
import * as maputils from "../../common/maputils"
import * as winston from "winston"

winston.clear()

describe("API", () => {
    describe("getProjectDelays", () => {
        it("Should get project deays", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const delays: Array<DelayDefinition> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 1, 1)
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 1, 15)
                }
            ]
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.resolve(delays))
            let projectNode = new FakeProjectNode(graph, "project")
            let delay1Node = new FakeDelayNode(projectNode, "delay1")
            delay1Node.initialMargin = 12
            delay1Node.margin = 34
            projectNode.delays.set("delay1", delay1Node)
            let delay2Node = new FakeDelayNode(projectNode, "delay1")
            delay2Node.initialMargin = 56
            delay2Node.margin = 78
            projectNode.delays.set("delay1", delay1Node)
            projectNode.delays.set("delay2", delay2Node)
            graph.nodes.set("project", projectNode)

            const expected: Array<ApiDelay> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 1, 1).toISOString(),
                    initialMargin: 12,
                    margin: 34
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 1, 15).toISOString(),
                    initialMargin: 56,
                    margin: 78
                }
            ]

            api.getProjectDelays("project").then((delays: Array<ApiDelay>) => {
                chai.expect(delays).to.deep.equal(expected)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.reject(new CorruptedError("Some error")))

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.reject(new InternalError("Some error")))

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const delays: Array<DelayDefinition> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 1, 1)
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 1, 15)
                }
            ]
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.resolve(delays))

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const delays: Array<DelayDefinition> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 1, 1)
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 1, 15)
                }
            ]
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.resolve(delays))
            let projectNode = new FakeProjectNode(graph, "project")
            graph.nodes.set("project", projectNode)

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getProjectDelays({value: "test"}).then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project delays 7", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectDelays").once().withExactArgs("project")
                .returns(Promise.reject(new FakeError("Some error")))

            api.getProjectDelays("project").then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
