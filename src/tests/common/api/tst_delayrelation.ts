import * as chai from "chai"
import {DelayRelationBuilder} from "../../../common/api/delayrelation"
import {DelayRelation} from "../../../common/delayrelation"
import {InputError} from "../../../common/errors/input"

describe("API Delay Relation", () => {
    describe("DelayRelationBuilder", () => {
        it("Should create a relation", () => {
            const relation: DelayRelation = {
                delay: "delay",
                task: "task",
                lag: 3
            }
            chai.expect(DelayRelationBuilder.create(relation)).to.deep.equal(relation)
        })
        it("Should not create a relation without delay", () => {
            const relation = {
                task: "task",
                lag: 3
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
        it("Should not create a relation with wrong delay", () => {
            const relation = {
                delay: {test: "test"},
                task: "task",
                lag: 3
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
        it("Should not create a relation without task", () => {
            const relation = {
                delay: "delay",
                lag: 3
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
        it("Should not create a relation with wrong task", () => {
            const relation = {
                delay: "delay",
                task: {test: "test"},
                lag: 3
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
        it("Should not create a relation without lag", () => {
            const relation = {
                delay: "delay",
                task: "task"
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
        it("Should not create a relation with wrong lag", () => {
            const relation = {
                delay: "delay",
                task: "task",
                lag: {test: "test"}
            }
            chai.expect(() => {
                DelayRelationBuilder.create(relation)
            }).to.throw(InputError)
        })
    })
})