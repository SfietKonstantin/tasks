import * as chai from "chai"
import * as sinon from "sinon"
import {TaskNode} from "../../../../server/graph/impl/tasknode"
import {DelayNode} from "../../../../server/graph/impl/delaynode"
import {MockDaoBuilder} from "../../dao/mockbuilder"
import {MockGraph} from "../mockgraph"
import {MockProjectNode} from "../mockprojectnode"
import {
    project1, taskd1, taskd4, delayd1, delayRelation4, modifier1, modifier5, modifier2,
    modifier4, taskd3, taskRelation3, milestoned1, taskd2, taskRelation1, taskRelation6, taskRelation2, taskRelation4,
    taskRelation5, taskRelation7
} from "../../testdata"
import {GraphError} from "../../../../server/graph/error/graph"
import {diffDates, addDays} from "../../../../common/utils/date"
import {MockTaskNode} from "../mocktasknode"

describe("Graph task node", () => {
    it("Should not compute when not needed", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)

        return node.compute()
    })
    it("Should get an exception for an invalid date", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            new Date(NaN), taskd1.estimatedDuration)
        return node.compute().then(() => {
            throw new Error("Input error should be detected")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(GraphError)
        })
    })
    it("Should compute the correct results based on modifiers at task end", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node = new TaskNode(daoBuilder, projectNode, taskd4.identifier,
            taskd4.estimatedStartDate, taskd4.estimatedDuration)
        const delayNode = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.addDelay(delayNode, delayRelation4)

        const endDate = addDays(taskd4.estimatedStartDate, taskd4.estimatedDuration)
        const diff = diffDates(endDate, delayd1.date)
        chai.expect(delayNode.initialMargin).to.equal(diff)
        chai.expect(delayNode.margin).to.equal(diff)

        node.modifiers = [modifier1, modifier5]

        return node.compute().then(() => {
            chai.expect(delayNode.initialMargin).to.equal(diff)
            chai.expect(delayNode.margin).to.equal(diff - modifier1.duration - modifier5.duration)
        })
    })
    it("Should compute the correct results based on modifiers at task beginning", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node = new TaskNode(daoBuilder, projectNode, taskd4.identifier,
            taskd4.estimatedStartDate, taskd4.estimatedDuration)
        const delayNode = new DelayNode(projectNode, delayd1.identifier, delayd1.date)
        node.addDelay(delayNode, delayRelation4)

        const endDate = addDays(taskd4.estimatedStartDate, taskd4.estimatedDuration)
        const diff = diffDates(endDate, delayd1.date)
        chai.expect(delayNode.initialMargin).to.equal(diff)
        chai.expect(delayNode.margin).to.equal(diff)

        node.modifiers = [modifier2, modifier4]

        return node.compute().then(() => {
            chai.expect(delayNode.initialMargin).to.equal(diff)
            chai.expect(delayNode.margin).to.equal(diff - modifier2.duration - modifier4.duration)
        })
    })
    it("Should compute children when they are added", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        const node2 = new MockTaskNode(projectNode, taskd3.identifier,
            taskd3.estimatedStartDate, taskd3.estimatedDuration)
        let mockNode2 = sinon.mock(node2)
        mockNode2.expects("markAndCompute").once()
            .withExactArgs(sinon.match.defined)
            .returns(Promise.resolve())

        return node1.addChild(node2, taskRelation3).then(() => {
            mockNode2.verify()
        })
    })
    it("Should recompute when adding modifiers", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        const node2 = new MockTaskNode(projectNode, taskd3.identifier,
            taskd3.estimatedStartDate, taskd3.estimatedDuration)
        let mockNode2 = sinon.mock(node2)
        mockNode2.expects("markAndCompute").twice()
            .withExactArgs(sinon.match.defined)
            .returns(Promise.resolve())

        daoBuilder.mockModifierDao.expects("addModifier").once()
            .withExactArgs(project1.identifier, modifier1)
            .returns(Promise.resolve(1))
        daoBuilder.mockModifierDao.expects("addModifierForTask")
            .once().withExactArgs(project1.identifier, 1, taskd1.identifier)
            .returns(Promise.resolve())

        return node1.addChild(node2, taskRelation3).then(() => {
            return node1.addModifier(modifier1)
        }).then(() => {
            chai.expect(node1.startDate).to.deep.equal(taskd1.estimatedStartDate)
            chai.expect(node1.duration).to.equal(taskd1.estimatedDuration + modifier1.duration)
            daoBuilder.verify()
            mockNode2.verify()
        })
    })
    it("Should correctly compute milestones", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, milestoned1.identifier,
            milestoned1.estimatedStartDate, milestoned1.estimatedDuration)

        daoBuilder.mockModifierDao.expects("addModifier").once()
            .withExactArgs(project1.identifier, modifier1)
            .returns(Promise.resolve(1))
        daoBuilder.mockModifierDao.expects("addModifierForTask")
            .once().withExactArgs(project1.identifier, 1, milestoned1.identifier)
            .returns(Promise.resolve())

        return node1.addModifier(modifier1).then(() => {
            chai.expect(node1.startDate).to.deep.equal(addDays(milestoned1.estimatedStartDate, modifier1.duration))
            chai.expect(node1.duration).to.equal(0)
        })
    })
    it("Should take the parents in account when computing (Relation with End)", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        node1.modifiers = [modifier1, modifier2, modifier4]
        const node2 = new TaskNode(daoBuilder, projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)

        return node1.addChild(node2, taskRelation1).then(() => {
            chai.expect(node2.startDate).to.deep.equal(node1.getEndDate())
        })
    })
    it("Should take the parents in account when computing (Relation with Beginning)", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)
        const node2 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)

        return node1.addChild(node2, taskRelation7).then(() => {
            chai.expect(node2.startDate).to.deep.equal(node1.startDate)
        })
    })
    it("Should detect cyclic dependencies", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        const node2 = new TaskNode(daoBuilder, projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)

        return node1.addChild(node2, taskRelation1).then(() => {
            return node2.addChild(node1, taskRelation6)
        }).then(() => {
            throw new Error("Cyclic dependency should be detected")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(GraphError)
        })
    })
    it("Should handle diamonds", () => {
        const daoBuilder = new MockDaoBuilder()
        const graph = new MockGraph()
        const projectNode = new MockProjectNode(graph, project1.identifier)
        const node1 = new TaskNode(daoBuilder, projectNode, taskd1.identifier,
            taskd1.estimatedStartDate, taskd1.estimatedDuration)
        const node2 = new TaskNode(daoBuilder, projectNode, taskd2.identifier,
            taskd2.estimatedStartDate, taskd2.estimatedDuration)
        const node3 = new TaskNode(daoBuilder, projectNode, taskd3.identifier,
            taskd3.estimatedStartDate, taskd3.estimatedDuration)
        const node4 = new TaskNode(daoBuilder, projectNode, taskd4.identifier,
            taskd4.estimatedStartDate, taskd4.estimatedDuration)

        return node1.addChild(node2, taskRelation1).then(() => {
            return node1.addChild(node3, taskRelation2)
        }).then(() => {
            return node2.addChild(node4, taskRelation4)
        }).then(() => {
            return node3.addChild(node4, taskRelation5)
        })
    })
})
