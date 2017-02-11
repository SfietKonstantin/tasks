import * as chai from "chai"
import * as sinon from "sinon"
import {ModifierApiProvider} from "../../../server/api/modifier"
import {project1, taskd1, delayd1, modifier1, modifier2, modifier3} from "../testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../server/error/requesterror"
import {InternalError} from "../../../server/dao/error/internal"
import {FakeError} from "./fakeerror"
import {NotFoundError} from "../../../common/errors/notfound"
import {MockProjectNode} from "../graph/mockprojectnode"
import {MockTaskNode} from "../graph/mocktasknode"
import {MockDelayNode} from "../graph/mockdelaynode"
import {ApiTaskData} from "../../../server/api/taskdata"
import {TaskBuilder} from "../../../common/api/task"
import {DelayBuilder} from "../../../common/api/delay"

describe("API Modifier", () => {
    let daoBuilder: MockDaoBuilder
    let graph: MockGraph
    let apiProvider: ModifierApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        graph = new MockGraph()
        apiProvider = new ModifierApiProvider(daoBuilder, graph)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("addModifier", () => {
        it("Should add a modifier", (done) => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(taskd1))
            daoBuilder.mockDelayDao.expects("getDelay").once()
                .withExactArgs(project1.identifier, delayd1.identifier)
                .returns(Promise.resolve(delayd1))

            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const modifiers = [modifier1, modifier2]
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            const mockTaskNode = sinon.mock(taskNode)
            taskNode.modifiers = modifiers
            const delayNode = new MockDelayNode(projectNode, delayd1.identifier)
            delayNode.initialMargin = 123
            delayNode.margin = 456
            projectNode.tasks.set(taskd1.identifier, taskNode)
            projectNode.delays.set(delayd1.identifier, delayNode)
            taskNode.delays.push(delayNode)

            const expected: ApiTaskData = {
                project: project1,
                task: TaskBuilder.toApiTask(taskd1, taskd1.estimatedStartDate, taskd1.estimatedDuration),
                modifiers,
                delays: [DelayBuilder.toApiDelay(delayd1, 123, 456)]
            }

            mockTaskNode.expects("addModifier").once()
                .withExactArgs(modifier3)
                .returns(Promise.resolve(modifier3))

            apiProvider.addModifier(project1.identifier, taskd1.identifier, modifier3).then((task: ApiTaskData) => {
                chai.expect(task).to.deep.equal(expected)
                mockTaskNode.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on internal error", (done) => {
            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            const mockTaskNode = sinon.mock(taskNode)
            projectNode.tasks.set(taskd1.identifier, taskNode)

            mockTaskNode.expects("addModifier").once()
                .withExactArgs(modifier3)
                .returns(Promise.reject(new InternalError("Some error")))

            apiProvider.addModifier(project1.identifier, taskd1.identifier, modifier3).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mockTaskNode.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on not found error", (done) => {
            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            const mockTaskNode = sinon.mock(taskNode)
            projectNode.tasks.set(taskd1.identifier, taskNode)

            mockTaskNode.expects("addModifier").once()
                .withExactArgs(modifier3)
                .returns(Promise.reject(new NotFoundError("Some error")))

            apiProvider.addModifier(project1.identifier, taskd1.identifier, modifier3).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mockTaskNode.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on other error", (done) => {
            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            const mockTaskNode = sinon.mock(taskNode)
            projectNode.tasks.set(taskd1.identifier, taskNode)

            mockTaskNode.expects("addModifier").once()
                .withExactArgs(modifier3)
                .returns(Promise.reject(new FakeError("Some error")))

            apiProvider.addModifier(project1.identifier, taskd1.identifier, modifier3).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                mockTaskNode.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
