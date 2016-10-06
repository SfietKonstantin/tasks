import * as chai from "chai"
import { Task } from "../core/types"
import { CyclicDependencyError } from "../core/graph/igraph"
import * as graph from "../core/graph/graph"
import { TaskNode } from "../core/graph/types"

describe("Graph", () => {
    describe("Simple compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode(1)
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode(2)
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node0.addChild(node1)

            graph.compute(node0)

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 1 + 15).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
        it("Should compute the correct start time depending on old start time", () => {
            let node0 = new TaskNode(1)
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode(2)
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node1.startDate = new Date(2015, 9, 20)
            node0.addChild(node1)

            graph.compute(node0)

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 20).getTime())
            chai.expect(node1.duration).to.equals(15)
        })
    })
    describe("Dependencies compute test", () => {
        it("Should compute the correct start time", () => {
            let node0 = new TaskNode(1)
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode(2)
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node0.addChild(node1)

            let node2 = new TaskNode(3)
            node2.estimatedStartDate = new Date(2015, 9, 16)
            node2.estimatedDuration = 30
            node0.addChild(node2)

            let node3 = new TaskNode(4)
            node3.estimatedStartDate = new Date(2015, 10, 15)
            node3.estimatedDuration = 15
            node1.addChild(node3)
            node2.addChild(node3)

            graph.compute(node0)

            chai.expect(node0.startDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
            chai.expect(node0.duration).to.equals(15)
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node1.duration).to.equals(15)
            chai.expect(node2.startDate.getTime()).to.equals(new Date(2015, 9, 16).getTime())
            chai.expect(node2.duration).to.equals(30)
            chai.expect(node3.startDate.getTime()).to.equals(new Date(2015, 10, 15).getTime())
            chai.expect(node3.duration).to.equals(15)
        })
        it("Should compute the correct start time with impact", () => {
            let node0 = new TaskNode(1)
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15
            node0.impacts.push(8)
            node0.startDate = new Date(2015, 9, 2)

            let node1 = new TaskNode(2)
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15
            node1.startDate = new Date(2015, 9, 18)
            node1.impacts.push(10)
            node1.impacts.push(12)
            node0.addChild(node1)

            let node2 = new TaskNode(3)
            node2.estimatedStartDate = new Date(2015, 9, 16)
            node2.estimatedDuration = 30
            node2.startDate = new Date(2015, 9, 18)
            node0.addChild(node2)

            let node3 = new TaskNode(4)
            node3.estimatedStartDate = new Date(2015, 10, 15)
            node3.estimatedDuration = 15
            node3.startDate = new Date(2015, 10, 17)
            node3.impacts.push(15)
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
            let node0 = new TaskNode(1)
            node0.estimatedStartDate = new Date(2015, 9, 1)
            node0.estimatedDuration = 15

            let node1 = new TaskNode(2)
            node1.estimatedStartDate = new Date(2015, 9, 16)
            node1.estimatedDuration = 15

            let node2 = new TaskNode(3)
            node2.estimatedStartDate = new Date(2015, 9, 16)
            node2.estimatedDuration = 15

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
})
