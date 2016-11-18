import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskLocation, Modifier } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { ApiTask, ApiProjectTaskModifiers, createApiTask } from "../../common/apitypes"
import { IDataProvider, CorruptedError, InternalError } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { GraphError } from "../../server/core/graph/types"
import { ProjectNode, TaskNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph } from "./fakegraph"
import { FakeError } from "./fakeerror"
import * as maputils from "../../common/maputils"
import * as winston from "winston"

winston.clear()

describe("API", () => {
    describe("addModifier", () => {
        it("Should add modifier", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(project))
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            const modifiers: Array<Modifier> = [
                {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 4,
                    location: TaskLocation.Beginning
                },
                {
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: 2,
                    location: TaskLocation.End
                }
            ]
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            taskNode.modifiers = modifiers
            projectNode.nodes.set("task", taskNode)
            const expected: ApiProjectTaskModifiers = {
                project,
                task: createApiTask(task, new Date(2016, 2, 5), 32),
                modifiers
            }

            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))

            api.addModifier("project", "task", modifier).then((task: ApiProjectTaskModifiers) => {
                chai.expect(task).to.deep.equal(expected)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier)
                        .returns(Promise.reject(new InternalError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier)
                        .returns(Promise.reject(new NotFoundError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier)
                        .returns(Promise.reject(new GraphError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier)
                        .returns(Promise.reject(new FakeError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new CorruptedError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new InternalError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 7", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new FakeError("Some error")))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 8", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            mock.expects("getProject").once().withExactArgs("project")
                .returns(Promise.reject(new CorruptedError("Some error")))
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 9", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }
            mock.expects("getProject").once().withExactArgs("project")
                .returns(Promise.reject(new InternalError("Some error")))
            const task: Task = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 32)
            let taskNodeMock = sinon.mock(taskNode)
            projectNode.nodes.set("task", taskNode)
            taskNodeMock.expects("addModifier").once().withExactArgs(modifier).returns(Promise.resolve(modifier))
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))

            api.addModifier("project", "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                taskNodeMock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 10", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }

            api.addModifier({value: "test"}, "task", modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when adding modifier 11", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            const modifier: Modifier = {
                name: "Modifier 3",
                description: "Description 3",
                duration: 15,
                location: TaskLocation.End
            }

            api.addModifier("project", {value: "test"}, modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
