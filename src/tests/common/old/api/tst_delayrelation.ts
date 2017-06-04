import * as chai from "chai"
import {DelayRelationBuilder} from "../../../../common/old/api/delayrelation"
import {DelayRelation} from "../../../../common/old/delayrelation"
import {InputError} from "../../../../common/errors/input"

describe("API DelayRelationBuilder", () => {
    xit("Should create a relation from correct input", () => {
        const relation: DelayRelation = {
            delay: "delay",
            task: "task",
            lag: 3
        }
        chai.expect(DelayRelationBuilder.fromObject(relation)).to.deep.equal(relation)
    })
    xit("Should not create a relation from an input without delay", () => {
        const relation = {
            task: "task",
            lag: 3
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    xit("Should not create a relation from an input wrong delay type", () => {
        const relation = {
            delay: {test: "test"},
            task: "task",
            lag: 3
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    xit("Should not create a relation from an input without task", () => {
        const relation = {
            delay: "delay",
            lag: 3
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    xit("Should not create a relation from an input wrong task type", () => {
        const relation = {
            delay: "delay",
            task: {test: "test"},
            lag: 3
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    xit("Should not create a relation from an input without lag", () => {
        const relation = {
            delay: "delay",
            task: "task"
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
    xit("Should not create a relation from an input with a wrong lag type", () => {
        const relation = {
            delay: "delay",
            task: "task",
            lag: {test: "test"}
        }
        chai.expect(() => {
            DelayRelationBuilder.fromObject(relation)
        }).to.throw(InputError)
    })
})
