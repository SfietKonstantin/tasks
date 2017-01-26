import * as chai from "chai"
import {Builder} from "../../../common/api/delay"
import {DelayDefinition} from "../../../common/delay"
import {InputError} from "../../../common/errors/input"

describe("API Delay", () => {
    describe("Builder", () => {
        it("Should create a Delay", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            const delay: DelayDefinition = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15)
            }
            chai.expect(Builder.create(apiDelay)).to.deep.equal(delay)
        })
        it("Should not create a delay without identifier", () => {
            const apiDelay = {
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay with wrong identifier", () => {
            const apiDelay = {
                identifier: {test: "test"},
                name: "Name",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay without name", () => {
            const apiDelay = {
                identifier: "identifier",
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay with wrong name", () => {
            const apiDelay = {
                identifier: "identifier",
                name: {test: "test"},
                description: "Description",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay without description", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay with wrong description", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: {test: "test"},
                date: new Date(2015, 1, 15).toISOString()
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay without estimatedStartDate", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                estimatedDuration: 123
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
        it("Should not create a delay with wrong estimatedStartDate", () => {
            const apiDelay = {
                identifier: "identifier",
                name: "Name",
                description: "Description",
                date: {test: "test"}
            }
            chai.expect(() => {
                Builder.create(apiDelay)
            }).to.throw(InputError)
        })
    })
})

