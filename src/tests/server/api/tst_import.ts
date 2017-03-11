import * as chai from "chai"
import * as sinon from "sinon"
import {
    taskd1, taskd2, taskd3, taskd4, taskRelation1, taskRelation2, taskRelation4,
    taskRelation5, delayd1, delayd2, delayRelation4, delayRelation5, project1
} from "../../common/testdata"
import {TaskDefinition} from "../../../common/task"
import {DelayDefinition} from "../../../common/delay"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {MockGraph} from "../graph/mockgraph"
import {MockProjectNode} from "../graph/mockprojectnode"
import {MockTaskNode} from "../graph/mocktasknode"
import {TaskRelation} from "../../../common/taskrelation"
import {TaskRelationBuilder} from "../../../common/api/taskrelation"
import {ApiTaskDefinition, TaskBuilder} from "../../../common/api/task"
import {ApiDelayDefinition, DelayBuilder} from "../../../common/api/delay"
import {ImportApiProvider} from "../../../server/api/import"
import {MockDelayNode} from "../graph/mockdelaynode"
import {DelayRelation} from "../../../common/delayrelation"
import {DelayRelationBuilder} from "../../../common/api/delayrelation"
import {ExistsError} from "../../../server/error/exists"
import {RequestError} from "../../../server/error/request"
import {InternalError} from "../../../server/dao/error/internal"
import {FakeError} from "./fakeerror"
import {NotFoundError} from "../../../common/errors/notfound"

describe("API import", () => {
    const toApiTaskDefinition = (taskDefinition: TaskDefinition): ApiTaskDefinition => {
        return {
            identifier: taskDefinition.identifier,
            name: taskDefinition.name,
            description: taskDefinition.description,
            estimatedStartDate: taskDefinition.estimatedStartDate.toISOString(),
            estimatedDuration: taskDefinition.estimatedDuration
        }
    }
    const toApiDelayDefinition = (delayDefinition: DelayDefinition): ApiDelayDefinition => {
        return {
            identifier: delayDefinition.identifier,
            name: delayDefinition.name,
            description: delayDefinition.description,
            date: delayDefinition.date.toISOString()
        }
    }
    describe("import", () => {
        let daoBuilder: MockDaoBuilder
        let graph: MockGraph
        let mockGraph: sinon.SinonMock
        let apiProvider: ImportApiProvider
        const tasks = [
            toApiTaskDefinition(taskd1),
            toApiTaskDefinition(taskd2),
            toApiTaskDefinition(taskd3),
            toApiTaskDefinition(taskd4)
        ]
        const taskRelations = [taskRelation1, taskRelation2, taskRelation4, taskRelation5]
        const delays = [
            toApiDelayDefinition(delayd1),
            toApiDelayDefinition(delayd2)
        ]
        const delayRelations = [
            delayRelation4,
            delayRelation5
        ]
        beforeEach(() => {
            daoBuilder = new MockDaoBuilder()
            graph = new MockGraph()
            mockGraph = sinon.mock(graph)
            apiProvider = new ImportApiProvider(daoBuilder, graph)
        })
        afterEach(() => {
            daoBuilder.verify()
            mockGraph.verify()
        })
        it("Should import tasks and relations", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiTaskDefinition) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new MockTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once()
                    .withExactArgs(TaskBuilder.fromObject(task))
                    .returns(Promise.resolve(taskNode))
                return taskNode
            })
            taskRelations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addTaskRelation").once()
                    .withExactArgs(TaskRelationBuilder.fromObject(relation))
                    .returns(Promise.resolve())
            })
            delays.map((delay: ApiDelayDefinition) => {
                const delayNode = new MockDelayNode(projectNode, delay.identifier)
                projectNodeMock.expects("addDelay").once()
                    .withExactArgs(DelayBuilder.fromObject(delay))
                    .returns(Promise.resolve(delayNode))
            })
            delayRelations.map((relation: DelayRelation) => {
                projectNodeMock.expects("addDelayRelation").once()
                    .withExactArgs(DelayRelationBuilder.fromObject(relation))
                    .returns(Promise.resolve())
            })

            return apiProvider.import(project1, tasks, taskRelations, delays, delayRelations).then(() => {
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on existing project", () => {
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.reject(new ExistsError("Some error")))

            return apiProvider.import(project1, tasks, taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception on internal error for project", () => {
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.import(project1, tasks, taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        it("Should get an exception on other error", () => {
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.import(project1, tasks, taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
        it("Should get an exception on existing task", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiTaskDefinition) => {
                projectNodeMock.expects("addTask").atMost(1)
                    .withExactArgs(TaskBuilder.fromObject(task))
                    .returns(Promise.reject(new ExistsError("Some error")))
            })

            return apiProvider.import(project1, tasks, taskRelations, [], []).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on internal error for task", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiTaskDefinition) => {
                projectNodeMock.expects("addTask").atMost(1)
                    .withExactArgs(TaskBuilder.fromObject(task))
                    .returns(Promise.reject(new InternalError("Some error")))
            })

            return apiProvider.import(project1, tasks, taskRelations, [], []).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on inexisting task relation", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiTaskDefinition) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new MockTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once()
                    .withExactArgs(TaskBuilder.fromObject(task))
                    .returns(Promise.resolve(taskNode))
                return taskNode
            })
            taskRelations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addTaskRelation").atMost(1)
                    .withExactArgs(TaskRelationBuilder.fromObject(relation))
                    .returns(Promise.reject(new NotFoundError("Some error")))
            })

            return apiProvider.import(project1, tasks, taskRelations, [], []).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on existing delay", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            delays.map((delay: ApiDelayDefinition) => {
                projectNodeMock.expects("addDelay").atMost(1)
                    .withExactArgs(DelayBuilder.fromObject(delay))
                    .returns(Promise.reject(new ExistsError("Some error")))
            })

            return apiProvider.import(project1, [], [], delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on internal error for delay", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            delays.map((delay: ApiDelayDefinition) => {
                projectNodeMock.expects("addDelay").atMost(1)
                    .withExactArgs(DelayBuilder.fromObject(delay))
                    .returns(Promise.reject(new InternalError("Some error")))
            })

            return apiProvider.import(project1, [], [], delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception on inexisting delay relation", () => {
            let projectNode = new MockProjectNode(graph, project1.identifier)
            mockGraph.expects("addProject").once()
                .withExactArgs(project1)
                .returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            delays.map((delay: ApiDelayDefinition) => {
                projectNodeMock.expects("addDelay").once()
                    .withExactArgs(DelayBuilder.fromObject(delay))
                    .returns(Promise.resolve())
            })
            delayRelations.map((relation: DelayRelation) => {
                projectNodeMock.expects("addDelayRelation").atMost(1)
                    .withExactArgs(DelayRelationBuilder.fromObject(relation))
                    .returns(Promise.reject(new NotFoundError("Some error")))
            })

            return apiProvider.import(project1, [], [], delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                projectNodeMock.verify()
            })
        })
        it("Should get an exception for an invalid project input", () => {
            return apiProvider.import({test: "test"}, tasks, taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid task list input", () => {
            return apiProvider.import(project1, {test: "test"}, taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid task input", () => {
            return apiProvider.import(project1, [{test: "test"}], taskRelations, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid task relation list input", () => {
            return apiProvider.import(project1, tasks, {test: "test"}, delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid task relation input", () => {
            return apiProvider.import(project1, tasks, [{test: "test"}], delays, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid delay list input", () => {
            return apiProvider.import(project1, tasks, taskRelations, {test: "test"}, delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid delay input", () => {
            return apiProvider.import(project1, tasks, taskRelations, [{test: "test"}], delayRelations).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid delay relation list input", () => {
            return apiProvider.import(project1, tasks, taskRelations, delays, {test: "test"}).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
        it("Should get an exception for an invalid delay relation input", () => {
            return apiProvider.import(project1, tasks, taskRelations, delays, [{test: "test"}]).then(() => {
                throw new Error("import should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
            })
        })
    })
})
