import * as chai from "chai"
import {TaskRelationBuilder} from "../../../common/api/taskrelation"
import {TaskRelation} from "../../../common/taskrelation"
import {TaskLocation} from "../../../common/tasklocation"
import {InputError} from "../../../common/errors/input"

describe("API Task Relation", () => {
    describe("TaskRelationBuilder", () => {
        describe("createTaskRelation", () => {
            it("Should create a relation 1", () => {
                const relation: TaskRelation = {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: "task2",
                    lag: 3
                }
                chai.expect(TaskRelationBuilder.create(relation)).to.deep.equal(relation)
            })
            it("Should create a relation 2", () => {
                const relation: TaskRelation = {
                    previous: "task1",
                    previousLocation: TaskLocation.End,
                    next: "task2",
                    lag: 3
                }
                chai.expect(TaskRelationBuilder.create(relation)).to.deep.equal(relation)
            })
            it("Should not create a relation without previous", () => {
                const relation = {
                    previousLocation: TaskLocation.Beginning,
                    next: "task2",
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation with wrong previous", () => {
                const relation = {
                    previous: {test: "test"},
                    previousLocation: TaskLocation.Beginning,
                    next: "task2",
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation without previousLocation", () => {
                const relation = {
                    previous: "task1",
                    next: "task2",
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation with wrong previousLocation 1", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: {test: "test"},
                    next: "task2",
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation with wrong previousLocation 2", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: 123,
                    next: "task2",
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation without next", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation with wrong next", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: {test: "test"},
                    lag: 3
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation without lag", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: "task2"
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
            it("Should not create a relation with wrong lag", () => {
                const relation = {
                    previous: "task1",
                    previousLocation: TaskLocation.Beginning,
                    next: "task2",
                    lag: {test: "test"}
                }
                chai.expect(() => {
                    TaskRelationBuilder.create(relation)
                }).to.throw(InputError)
            })
        })
    })
})

