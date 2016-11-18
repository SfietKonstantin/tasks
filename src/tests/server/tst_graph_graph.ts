import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskResults, TaskRelation, Modifier, TaskLocation, Delay, DelayRelation } from "../../common/types"
import { ExistsError } from "../../common/errors"
import { FakeDataProvider } from "./fakedataprovider"
import { Graph, ProjectNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("Graph", () => {
        it("Should load the graph", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const projects: Array<Project> = [
                {
                    identifier: "project",
                    name: "Project",
                    description: "Description"
                },
                {
                    identifier: "other",
                    name: "Other project",
                    description: "Other description"
                }
            ]
            const tasks: Array<Task> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16),
                    estimatedDuration: 30
                }
            ]
            const delays: Array<Delay> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 11, 30)
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 11, 30)
                }
            ]
            const otherTasks: Array<Task> = [
                {
                    identifier: "other1",
                    name: "Other task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 2, 1),
                    estimatedDuration: 31
                },
                {
                    identifier: "other2",
                    name: "Other task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 2, 1),
                    estimatedDuration: 10
                }
            ]
            const otherDelays: Array<Delay> = []
            const results: Array<[string, string, TaskResults]> = [
                [
                    "project",
                    "root",
                    {
                        startDate: new Date(2016, 7, 15),
                        duration: 36
                    }
                ],
                [
                    "project",
                    "long",
                    {
                        startDate: new Date(2016, 8, 20),
                        duration: 60
                    }
                ],
                [
                    "project",
                    "short",
                    {
                        startDate: new Date(2016, 8, 20),
                        duration: 65
                    }
                ],
                [
                    "project",
                    "reducing",
                    {
                        startDate: new Date(2016, 10, 24),
                        duration: 30
                    }
                ],
                [
                    "other",
                    "other1",
                    {
                        startDate: new Date(2016, 2, 1),
                        duration: 31
                    }
                ],
                [
                    "other",
                    "other2",
                    {
                        startDate: new Date(2016, 2, 1),
                        duration: 15
                    }
                ]
            ]
            mock.expects("getAllProjects").once().returns(Promise.resolve(projects))
            mock.expects("getProjectTasks").once().withExactArgs("project").returns(Promise.resolve(tasks))
            mock.expects("getProjectTasks").once().withExactArgs("other").returns(Promise.resolve(otherTasks))
            results.forEach((result: [string, string, TaskResults]) => {
                mock.expects("getTaskResults").once().withExactArgs(result[0], result[1])
                    .returns(Promise.resolve(result[2]))
            })
            mock.expects("getProjectDelays").once().withExactArgs("project").returns(Promise.resolve(delays))
            mock.expects("getProjectDelays").once().withExactArgs("other").returns(Promise.resolve(otherDelays))
            const rootModifiers: Array<Modifier> = [
                {
                    name: "Root modifier",
                    description: "Root modifier description",
                    duration: 5,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withExactArgs("project", "root")
                .returns(Promise.resolve(rootModifiers))
            mock.expects("getTaskModifiers").once().withExactArgs("project", "long")
                .returns(Promise.resolve([]))
            const shortModifiers: Array<Modifier> = [
                {
                    name: "Short modifier 1",
                    description: "Short modifier 1 description",
                    duration: 10,
                    location: TaskLocation.End
                },
                {
                    name: "Short modifier 2",
                    description: "Short modifier 2 description",
                    duration: 24,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withExactArgs("project", "short")
                .returns(Promise.resolve(shortModifiers))
            mock.expects("getTaskModifiers").once().withExactArgs("project", "reducing")
                .returns(Promise.resolve([]))
            mock.expects("getTaskModifiers").once().withExactArgs("other", "other1")
                .returns(Promise.resolve([]))
            mock.expects("getTaskModifiers").once().withExactArgs("other", "other2")
                .returns(Promise.resolve([]))

            const rootRelations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "short",
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "root")
                .returns(Promise.resolve(rootRelations))
            const longRelations: Array<TaskRelation> = [
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "long")
                .returns(Promise.resolve(longRelations))
            const shortRelations: Array<TaskRelation> = [
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 0

                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withExactArgs("project", "reducing")
                .returns(Promise.resolve([]))
            const delay1relations: Array<DelayRelation> = [
                {
                    delay: "delay1",
                    task: "reducing",
                    lag: 0
                }
            ]
            const delay2relations: Array<DelayRelation> = [
                {
                    delay: "delay2",
                    task: "reducing",
                    lag: 5
                }
            ]
            mock.expects("getDelayRelations").once().withExactArgs("project", "delay1")
                .returns(Promise.resolve(delay1relations))
            mock.expects("getDelayRelations").once().withExactArgs("project", "delay2")
                .returns(Promise.resolve(delay2relations))
            mock.expects("getTaskRelations").once().withExactArgs("other", "other1")
                .returns(Promise.resolve([]))
            mock.expects("getTaskRelations").once().withExactArgs("other", "other2")
                .returns(Promise.resolve([]))


            // Test
            let node = new Graph(dataProvider)
            node.load().then(() => {
                const project = maputils.get(node.nodes, "project")
                const root = maputils.get(project.nodes, "root")
                chai.expect(root.taskIdentifier).to.equal("root")
                chai.expect(root.startDate).to.deep.equal(new Date(2016, 7, 15))
                chai.expect(root.duration).to.equal(36)
                chai.expect(root.modifiers).to.deep.equal(rootModifiers)
                const short = maputils.get(project.nodes, "short")
                chai.expect(short.taskIdentifier).to.equal("short")
                chai.expect(short.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(short.duration).to.equal(65)
                chai.expect(short.modifiers).to.deep.equal(shortModifiers)
                const long = maputils.get(project.nodes, "long")
                chai.expect(long.taskIdentifier).to.equal("long")
                chai.expect(long.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(long.duration).to.equal(60)
                chai.expect(long.modifiers).to.deep.equal([])
                const reducing = maputils.get(project.nodes, "reducing")
                chai.expect(reducing.taskIdentifier).to.equal("reducing")
                chai.expect(reducing.startDate).to.deep.equal(new Date(2016, 10, 24))
                chai.expect(reducing.duration).to.equal(30)
                chai.expect(reducing.modifiers).to.deep.equal([])
                const delay1 = maputils.get(project.delays, "delay1")
                chai.expect(delay1.delayIdentifier).to.equal("delay1")
                chai.expect(delay1.margin).to.equal(6)
                const delay2 = maputils.get(project.delays, "delay2")
                chai.expect(delay2.delayIdentifier).to.equal("delay2")
                chai.expect(delay2.margin).to.equal(1)
                const other = maputils.get(node.nodes, "other")
                const other1 = maputils.get(other.nodes, "other1")
                chai.expect(other1.taskIdentifier).to.equal("other1")
                chai.expect(other1.startDate).to.deep.equal(new Date(2016, 2, 1))
                chai.expect(other1.duration).to.equal(31)
                chai.expect(other1.modifiers).to.deep.equal([])
                const other2 = maputils.get(other.nodes, "other2")
                chai.expect(other2.taskIdentifier).to.equal("other2")
                chai.expect(other2.startDate).to.deep.equal(new Date(2016, 2, 1))
                chai.expect(other2.duration).to.equal(15)
                chai.expect(other2.modifiers).to.deep.equal([])
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a project", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new Graph(dataProvider)
            const projectNode = new ProjectNode(dataProvider, node, "project1")
            node.nodes.set("project1", projectNode)

            const project: Project = {
                identifier: "project2",
                name: "Project 2",
                description: "Description 2"
            }
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve())

            node.addProject(project).then(() => {
                const projectNode = maputils.get(node.nodes, "project2")
                chai.expect(projectNode.projectIdentifier).to.equal("project2")
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding existing project", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new Graph(dataProvider)
            const projectNode = new ProjectNode(dataProvider, node, "project1")
            node.nodes.set("project1", projectNode)

            const project: Project = {
                identifier: "project1",
                name: "Project 1",
                description: "Description 1"
            }

            node.addProject(project).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
