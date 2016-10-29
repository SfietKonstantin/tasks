import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskResults, Modifier, TaskLocation } from "../../common/types"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph, FakeProjectNode } from "./fakegraph"
import { GraphError } from "../../server/core/graph/types"
import { Graph, ProjectNode, TaskNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("TaskNode", () => {
        it("Should not compute when not needed", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            const node = new TaskNode(dataProvider, projectNode, "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute the correct results", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                startDate: new Date(2015, 2, 1),
                duration: 20
            }
            mock.expects("setTaskResults").once().withExactArgs("project", "task", arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, projectNode, "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 5), 25)
            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get error on invalid input", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            const node = new TaskNode(dataProvider, projectNode, "task", new Date(NaN), 20,
                                      new Date(2015, 2, 1), 20)
            node.compute().then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute the correct results based on modifiers 1", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            const arg: TaskResults = {
                startDate: new Date(2015, 2, 1),
                duration: 23
            }
            mock.expects("setTaskResults").once().withExactArgs("project", "task", arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, projectNode, "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.modifiers = [
                {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.End
                },
                {
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: -2,
                    location: TaskLocation.End
                }
            ]

            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute the correct results based on modifiers 2", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            const arg: TaskResults = {
                startDate: new Date(2015, 2, 4),
                duration: 20
            }
            mock.expects("setTaskResults").once().withExactArgs("project", "task", arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, projectNode, "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.modifiers = [
                {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.Beginning
                },
                {
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: -2,
                    location: TaskLocation.Beginning
                }
            ]

            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute children when adding", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withExactArgs("project", "task2", arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, projectNode, "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, projectNode, "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should recompute when adding modifiers", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")

            const modifier: Modifier = {
                name: "Modifier 1",
                description: "Description 1",
                duration: 2,
                location: TaskLocation.End
            }
            const results: Array<[string, TaskResults]> = [
                [
                    "task2",
                    {
                        startDate: new Date(2015, 2, 21),
                        duration: 15
                    }
                ],
                [
                    "task1",
                    {
                        startDate: new Date(2015, 2, 1),
                        duration: 22
                    }
                ],
                [
                    "task2",
                    {
                        startDate: new Date(2015, 2, 23),
                        duration: 15
                    }
                ]
            ]
            mock.expects("addModifier").once().withExactArgs("project", modifier).returns(Promise.resolve(1))
            mock.expects("setModifierForTask").once().withExactArgs("project", 1, "task1")
                .returns(Promise.resolve())
            const expectations = results.map((result: [string, TaskResults]) => {
                return mock.expects("setTaskResults").once().withExactArgs("project", result[0], result[1])
                           .returns(Promise.resolve())
            })

            // Test
            const node1 = new TaskNode(dataProvider, projectNode, "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, projectNode, "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                chai.expect(expectations[0].called).to.true
                chai.expect(expectations[1].called).to.false
                chai.expect(expectations[2].called).to.false
                return node1.addModifier(modifier)
            }).then(() => {
                chai.expect(node1.startDate).to.deep.equal(new Date(2015, 2, 1))
                chai.expect(node1.duration).to.equal(22)
                chai.expect(node2.startDate).to.deep.equal(new Date(2015, 2, 23))
                chai.expect(node2.duration).to.equal(15)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should correctly compute milestones", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 1",
                description: "Description 1",
                duration: 2,
                location: TaskLocation.End
            }
            const results: TaskResults = {
                startDate: new Date(2015, 2, 3),
                duration: 0
            }
            mock.expects("addModifier").once().withExactArgs("project", modifier).returns(Promise.resolve(1))
            mock.expects("setModifierForTask").once().withExactArgs("project", 1, "task1")
                .returns(Promise.resolve())
            mock.expects("setTaskResults").once().withExactArgs("project", "task1", results).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, projectNode, "task1", new Date(2015, 2, 1), 0,
                                       new Date(2015, 2, 1), 0)

            node1.addModifier(modifier).then(() => {
                chai.expect(node1.startDate).to.deep.equal(new Date(2015, 2, 3))
                chai.expect(node1.duration).to.equal(0)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should detect cyclic dependencies", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            const projectNode = new FakeProjectNode(graph, "project")
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withExactArgs("project", "task2", arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, projectNode, "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, projectNode, "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                return node2.addChild(node1, {
                previous: "task2",
                previousLocation: TaskLocation.End,
                next: "task1",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            })
            }).then(() => {
                done(new Error("Cyclic dependency should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
