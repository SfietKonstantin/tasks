import * as chai from "chai"
import {DelayBuilder} from "../../../common/api/delay"
import {DelayDefinition} from "../../../common/delay"
import {InputError} from "../../../common/errors/input"

describe("API DelayBuilder", () => {
    it("Should create a Delay from correct input", () => {
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
        chai.expect(DelayBuilder.fromObject(apiDelay)).to.deep.equal(delay)
    })
    it("Should not create a delay from an input without identifier", () => {
        const apiDelay = {
            name: "Name",
            description: "Description",
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input wrong identifier type", () => {
        const apiDelay = {
            identifier: {test: "test"},
            name: "Name",
            description: "Description",
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input without name", () => {
        const apiDelay = {
            identifier: "identifier",
            description: "Description",
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input with a wrong name type", () => {
        const apiDelay = {
            identifier: "identifier",
            name: {test: "test"},
            description: "Description",
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input without description", () => {
        const apiDelay = {
            identifier: "identifier",
            name: "Name",
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input with a wrong description type", () => {
        const apiDelay = {
            identifier: "identifier",
            name: "Name",
            description: {test: "test"},
            date: new Date(2015, 1, 15).toISOString()
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input without estimatedStartDate", () => {
        const apiDelay = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            estimatedDuration: 123
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
    it("Should not create a delay from an input wrong estimatedStartDate type", () => {
        const apiDelay = {
            identifier: "identifier",
            name: "Name",
            description: "Description",
            date: {test: "test"}
        }
        chai.expect(() => {
            DelayBuilder.fromObject(apiDelay)
        }).to.throw(InputError)
    })
})

