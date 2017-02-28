import * as chai from "chai"
import * as sinon from "sinon"
import {ProjectNode} from "../../../../server/graph/impl/projectnode"
import {MockDaoBuilder} from "../../dao/mockbuilder"
import {MockNodeFactory} from "./mocknodefactory"
import {MockGraph} from "../mockgraph"
import {MockTaskNode} from "../mocktasknode"
import {MockDelayNode} from "../mockdelaynode"
import {
    project1, taskd1, taskd2, taskd3, taskd4, delayd1, delayd2, modifier1, modifier2,
    modifier3, taskRelation1, taskRelation2, taskRelation4, taskRelation5, delayRelation4, delayRelation5,
    delayRelation1
} from "../../../common/testdata"
import {get as mapGet} from "../../../../common/utils/map"
import {ExistsError} from "../../../../server/error/exists"
import {NotFoundError} from "../../../../common/errors/notfound"

describe("Graph project node", () => {
    it("Should load the a project", () => {
        // Node
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const task1Node = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        let mockTask1Node = sinon.mock(task1Node)
        mockTask1Node.expects("compute").once()
            .withExactArgs()
            .returns(Promise.resolve())

        const task2Node = new MockTaskNode(node, taskd2.identifier, taskd2.estimatedStartDate, taskd2.estimatedDuration)
        let mockTask2Node = sinon.mock(task2Node)
        mockTask2Node.expects("compute").once()
            .withExactArgs()
            .returns(Promise.resolve())

        const task3Node = new MockTaskNode(node, taskd3.identifier, taskd3.estimatedStartDate, taskd3.estimatedDuration)
        let mockTask3Node = sinon.mock(task3Node)
        mockTask3Node.expects("compute").once()
            .withExactArgs()
            .returns(Promise.resolve())

        const task4Node = new MockTaskNode(node, taskd4.identifier, taskd4.estimatedStartDate, taskd4.estimatedDuration)
        let mockTask4Node = sinon.mock(task4Node)
        mockTask4Node.expects("compute").once()
            .withExactArgs()
            .returns(Promise.resolve())

        mockTask1Node.expects("addChild").once()
            .withExactArgs(task2Node, taskRelation1)
            .returns(Promise.resolve())
        mockTask1Node.expects("addChild").once()
            .withExactArgs(task3Node, taskRelation2)
            .returns(Promise.resolve())
        mockTask2Node.expects("addChild").once()
            .withExactArgs(task4Node, taskRelation4)
            .returns(Promise.resolve())
        mockTask3Node.expects("addChild").once()
            .withExactArgs(task4Node, taskRelation5)
            .returns(Promise.resolve())

        const delay1Node = new MockDelayNode(node, delayd1.identifier)
        const delay2Node = new MockDelayNode(node, delayd2.identifier)

        mockTask4Node.expects("addDelay").once()
            .withExactArgs(delay1Node, delayRelation4)
        mockTask4Node.expects("addDelay").once()
         .withExactArgs(delay2Node, delayRelation5)

        mockNodeFactory.expects("createTaskNode").once()
            .withExactArgs(daoBuilder, node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
            .returns(task1Node)
        mockNodeFactory.expects("createTaskNode").once()
            .withExactArgs(daoBuilder, node, taskd2.identifier, taskd2.estimatedStartDate, taskd2.estimatedDuration)
            .returns(task2Node)
        mockNodeFactory.expects("createTaskNode").once()
            .withExactArgs(daoBuilder, node, taskd3.identifier, taskd3.estimatedStartDate, taskd3.estimatedDuration)
            .returns(task3Node)
        mockNodeFactory.expects("createTaskNode").once()
            .withExactArgs(daoBuilder, node, taskd4.identifier, taskd4.estimatedStartDate, taskd4.estimatedDuration)
            .returns(task4Node)
        mockNodeFactory.expects("createDelayNode").once()
            .withExactArgs(node, delayd1.identifier, delayd1.date)
            .returns(delay1Node)
        mockNodeFactory.expects("createDelayNode").once()
            .withExactArgs(node, delayd2.identifier, delayd2.date)
            .returns(delay2Node)

        daoBuilder.mockTaskDao.expects("getProjectTasks").once()
            .withExactArgs(project1.identifier)
            .returns(Promise.resolve([taskd1, taskd2, taskd3, taskd4]))

        daoBuilder.mockDelayDao.expects("getProjectDelays").once()
            .withExactArgs(project1.identifier)
            .returns(Promise.resolve([delayd1, delayd2]))

        daoBuilder.mockModifierDao.expects("getTaskModifiers").once()
            .withExactArgs(project1.identifier, taskd1.identifier)
            .returns(Promise.resolve([modifier1]))
        daoBuilder.mockModifierDao.expects("getTaskModifiers").once()
            .withExactArgs(project1.identifier, taskd2.identifier)
            .returns(Promise.resolve([]))
        daoBuilder.mockModifierDao.expects("getTaskModifiers").once()
            .withExactArgs(project1.identifier, taskd3.identifier)
            .returns(Promise.resolve([modifier2, modifier3]))
        daoBuilder.mockModifierDao.expects("getTaskModifiers").once()
            .withExactArgs(project1.identifier, taskd4.identifier)
            .returns(Promise.resolve([]))

        daoBuilder.mockTaskRelationDao.expects("getTaskRelations").once()
            .withExactArgs(project1.identifier, taskd1.identifier)
            .returns(Promise.resolve([taskRelation1, taskRelation2]))
        daoBuilder.mockTaskRelationDao.expects("getTaskRelations").once()
            .withExactArgs(project1.identifier, taskd2.identifier)
            .returns(Promise.resolve([taskRelation4]))
        daoBuilder.mockTaskRelationDao.expects("getTaskRelations").once()
            .withExactArgs(project1.identifier, taskd3.identifier)
            .returns(Promise.resolve([taskRelation5]))
        daoBuilder.mockTaskRelationDao.expects("getTaskRelations").once()
            .withExactArgs(project1.identifier, taskd4.identifier)
            .returns(Promise.resolve([]))

        daoBuilder.mockDelayRelationDao.expects("getDelayRelations").once()
            .withExactArgs(project1.identifier, delayd1.identifier)
            .returns(Promise.resolve([delayRelation4]))
        daoBuilder.mockDelayRelationDao.expects("getDelayRelations").once()
            .withExactArgs(project1.identifier, delayd2.identifier)
            .returns(Promise.resolve([delayRelation5]))

        // Test
        return node.load().then(() => {
            chai.expect(mapGet(node.tasks, taskd1.identifier)).to.deep.equal(task1Node)
            chai.expect(mapGet(node.tasks, taskd2.identifier)).to.deep.equal(task2Node)
            chai.expect(mapGet(node.tasks, taskd3.identifier)).to.deep.equal(task3Node)
            chai.expect(mapGet(node.tasks, taskd4.identifier)).to.deep.equal(task4Node)

            chai.expect(mapGet(node.delays, delayd1.identifier)).to.deep.equal(delay1Node)
            chai.expect(mapGet(node.delays, delayd2.identifier)).to.deep.equal(delay2Node)

            daoBuilder.verify()
            mockNodeFactory.verify()
            mockTask1Node.verify()
            mockTask2Node.verify()
            mockTask3Node.verify()
            mockTask4Node.verify()
        })
    })
    it("Should add a new task in the graph", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        daoBuilder.mockTaskDao.expects("addTask").once()
            .withExactArgs(project1.identifier, taskd1).returns(Promise.resolve())
        mockNodeFactory.expects("createTaskNode").once()
            .withExactArgs(daoBuilder, node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
            .returns(taskNode)

        // Test
        return node.addTask(taskd1).then(() => {
            chai.expect(mapGet(node.tasks, taskd1.identifier)).to.deep.equal(taskNode)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
    it("Should get an exception when adding an existing task", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        node.tasks.set(taskd1.identifier, new MockTaskNode(node, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration))

        daoBuilder.mockTaskDao.expects("addTask").never()
        mockNodeFactory.expects("createTaskNode").never()

        return node.addTask(taskd1).then(() => {
            throw new Error("addTask should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(ExistsError)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
    it("Should add a new relation between tasks in the graph", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode1 = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        let mockTaskNode1 = sinon.mock(taskNode1)
        const taskNode2 = new MockTaskNode(node, taskd2.identifier, taskd2.estimatedStartDate, taskd2.estimatedDuration)
        node.tasks.set(taskd1.identifier, taskNode1)
        node.tasks.set(taskd2.identifier, taskNode2)

        mockTaskNode1.expects("addChild").once()
            .withExactArgs(taskNode2, taskRelation1).returns(Promise.resolve())

        daoBuilder.mockTaskRelationDao.expects("addTaskRelation").once()
            .withExactArgs(project1.identifier, taskRelation1).returns(Promise.resolve())

        // Test
        return node.addTaskRelation(taskRelation1).then(() => {
            daoBuilder.verify()
            mockTaskNode1.verify()
        })
    })
    it("Should get an exception when adding relation with invalid previous node", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode2 = new MockTaskNode(node, taskd2.identifier, taskd2.estimatedStartDate, taskd2.estimatedDuration)
        node.tasks.set(taskd2.identifier, taskNode2)

        // Test
        return node.addTaskRelation(taskRelation1).then(() => {
            throw new Error("addTaskRelation should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(NotFoundError)
            daoBuilder.verify()
        })
    })
    it("Should get an exception when adding relation with invalid next node", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode1 = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        node.tasks.set(taskd1.identifier, taskNode1)

        // Test
        return node.addTaskRelation(taskRelation1).then(() => {
            throw new Error("addTaskRelation should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(NotFoundError)
            daoBuilder.verify()
        })
    })
    it("Should add a new delay in the graph", () => {
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const delayNode = new MockDelayNode(node, taskd1.identifier)
        daoBuilder.mockDelayDao.expects("addDelay").once()
            .withExactArgs(project1.identifier, delayd1).returns(Promise.resolve())
        mockNodeFactory.expects("createDelayNode").once()
            .withExactArgs(node, delayd1.identifier, delayd1.date)
            .returns(delayNode)

        // Test
        return node.addDelay(delayd1).then(() => {
            chai.expect(mapGet(node.delays, delayd1.identifier)).to.deep.equal(delayNode)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
    it("Should get an exception when adding an existing delay", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        node.delays.set(delayd1.identifier, new MockDelayNode(node, delayd1.identifier))

        daoBuilder.mockDelayDao.expects("addDelay").never()
        mockNodeFactory.expects("createDelayNode").never()

        return node.addDelay(delayd1).then(() => {
            throw new Error("addDelay should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(ExistsError)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
    it("Should add a new relation between a delay and a task in the graph", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        let mockTaskNode = sinon.mock(taskNode)
        const delayNode = new MockDelayNode(node, delayd1.identifier)
        node.tasks.set(taskd1.identifier, taskNode)
        node.delays.set(delayd1.identifier, delayNode)

        mockTaskNode.expects("addDelay").once()
            .withExactArgs(delayNode, delayRelation1).returns(Promise.resolve())

        daoBuilder.mockDelayRelationDao.expects("addDelayRelation").once()
            .withExactArgs(project1.identifier, delayRelation1).returns(Promise.resolve())

        // Test
        return node.addDelayRelation(delayRelation1).then(() => {
            daoBuilder.verify()
            mockTaskNode.verify()
        })
    })
    it("Should get an exception when adding relation with invalid task node", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const delayNode = new MockDelayNode(node, delayd1.identifier)
        node.delays.set(delayd1.identifier, delayNode)

        // Test
        return node.addDelayRelation(delayRelation1).then(() => {
            throw new Error("addDelayRelation should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(NotFoundError)
            daoBuilder.verify()
        })
    })
    it("Should get an exception when adding relation with invalid delay node", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        const graph = new MockGraph()
        let node = new ProjectNode(nodeFactory, daoBuilder, graph, project1.identifier)

        // Mock
        const taskNode = new MockTaskNode(node, taskd1.identifier, taskd1.estimatedStartDate, taskd1.estimatedDuration)
        node.tasks.set(taskd1.identifier, taskNode)

        // Test
        return node.addDelayRelation(delayRelation1).then(() => {
            throw new Error("addDelayRelation should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(NotFoundError)
            daoBuilder.verify()
        })
    })
})
