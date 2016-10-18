import * as chai from "chai"
import { Task } from "../../common/types"
import { CyclicDependencyError } from "../../server/core/graph/igraph"
import * as graph from "../../server/core/graph/graph"
import { TaskNode } from "../../server/core/graph/types"

describe("Graph", () => {
    describe("Simple compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode("task1", new Date(2015, 9, 1), 15)
            let node1 = new TaskNode("task2", new Date(2015, 9, 1), 15)
            node0.addChild(node1)

            graph.compute(node0)

            chai.expect((node0.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect((node1.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 15).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
        it("Should compute the correct start time depending on old start time", () => {
            let node0 = new TaskNode("task1", new Date(2015, 9, 1), 15)

            let node1 = new TaskNode("task2", new Date(2015, 9, 1), 15)
            node1.startDate = new Date(2015, 9, 20)
            node0.addChild(node1)

            graph.compute(node0)

            chai.expect((node0.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 20).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
    })
    describe("Dependencies compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode("root", new Date(2015, 9, 1), 15)

            let node1 = new TaskNode("short", new Date(2015, 9, 1), 15)
            node0.addChild(node1)

            let node2 = new TaskNode("long", new Date(2015, 9, 1), 30)
            node0.addChild(node2)

            let node3 = new TaskNode("reducing", new Date(2015, 9, 1), 15)
            node1.addChild(node3)
            node2.addChild(node3)

            graph.compute(node0)

            chai.expect((node0.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect((node1.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 15).getTime())
            chai.expect(node1.duration).to.equals(15)
            chai.expect((node2.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 15).getTime())
            chai.expect(node2.duration).to.equals(30)
            chai.expect((node3.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 15 + 30).getTime())
            chai.expect(node3.duration).to.equals(15)
        })
        it("Should compute the correct start time with modifier", () => {
            let node0 = new TaskNode("root", new Date(2015, 9, 1), 15)
            node0.modifiers.push(8)
            node0.startDate = new Date(2015, 9, 2)

            let node1 = new TaskNode("short", new Date(2015, 9, 1), 15)
            node1.startDate = new Date(2015, 9, 18)
            node1.modifiers.push(10)
            node1.modifiers.push(12)
            node0.addChild(node1)

            let node2 = new TaskNode("long", new Date(2015, 9, 1), 30)
            node2.startDate = new Date(2015, 9, 18)
            node0.addChild(node2)

            let node3 = new TaskNode("reducing", new Date(2015, 9, 1), 15)
            node3.startDate = new Date(2015, 10, 17)
            node3.modifiers.push(15)
            node1.addChild(node3)
            node2.addChild(node3)

            graph.compute(node0)

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 2).getTime())
            chai.expect(node0.duration).to.equals(23)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 2 + 23).getTime())
            chai.expect(node1.duration).to.equals(37)
            chai.expect(node2.startDate.getTime()).to.equals(new Date(2015, 9, 2 + 23).getTime())
            chai.expect(node2.duration).to.equals(30)
            chai.expect(node3.startDate.getTime()).to.equals(new Date(2015, 9, 2 + 23 + 37).getTime())
            chai.expect(node3.duration).to.equals(30)
        })
    })
    describe("Cyclic dependency", () => {
        it("Should detect a cyclic dependency", (done) => {
            let node0 = new TaskNode("task1", new Date(2015, 9, 1), 15)
            let node1 = new TaskNode("task2", new Date(2015, 9, 1), 15)
            let node2 = new TaskNode("task3", new Date(2015, 9, 1), 15)

            node0.addChild(node1)
            node0.addChild(node2)
            node1.addChild(node2)
            node2.addChild(node1)

            try {
                graph.compute(node0)
            } catch (err) {
                chai.expect(err).to.instanceof(Error)
                done()
                return
            }
            done(new Error("Cyclic dependency should not be a success"))
        })
    })
    describe("Milestone", () => {
        it("Should compute milestone modifier their own way", () => {
            let milestone = new TaskNode("milestone", new Date(2015, 9, 1), 0)
            milestone.modifiers.push(8)

            graph.compute(milestone)

            chai.expect((milestone.startDate as Date).getTime()).to.equals(new Date(2015, 9, 9).getTime())
            chai.expect(milestone.duration).to.equals(0)
        })
        it("End milestone should affect parent tasks", () => {
            let node = new TaskNode("task", new Date(2015, 9, 1), 15)
            let milestone = new TaskNode("milestone", new Date(2015, 9, 1), 0)
            node.addChild(milestone)

            graph.compute(node)

            chai.expect((node.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node.duration).to.equals(15)
            chai.expect((milestone.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 15).getTime())
            chai.expect(milestone.duration).to.equals(0)
        })
        it("End milestone should affect parent tasks (modifier)", () => {
            let node = new TaskNode("task", new Date(2015, 9, 1), 15)
            node.modifiers.push(8)
            let milestone = new TaskNode("milestone", new Date(2015, 9, 1), 0)
            node.addChild(milestone)

            graph.compute(node)

            chai.expect((node.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node.duration).to.equals(15 + 8)
            chai.expect((milestone.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 8 + 15).getTime())
            chai.expect(milestone.duration).to.equals(0)
        })
        it("Start milestone should affect children tasks", () => {
            let milestone = new TaskNode("milestone", new Date(2015, 9, 1), 0)
            let node = new TaskNode("task", new Date(2015, 9, 1), 15)
            milestone.addChild(node)

            graph.compute(milestone)

            chai.expect((milestone.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(milestone.duration).to.equals(0)
            chai.expect((node.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node.duration).to.equals(15)
        })
        it("Start milestone should affect children tasks (modifiers)", () => {
            let milestone = new TaskNode("milestone", new Date(2015, 9, 1), 0)
            milestone.modifiers.push(8)
            let node = new TaskNode("task", new Date(2015, 9, 1), 15)
            milestone.addChild(node)

            graph.compute(milestone)

            chai.expect((milestone.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 8).getTime())
            chai.expect(milestone.duration).to.equals(0)
            chai.expect((node.startDate as Date).getTime()).to.equals(new Date(2015, 9, 1 + 8).getTime())
            chai.expect(node.duration).to.equals(15)
        })
    })
})
