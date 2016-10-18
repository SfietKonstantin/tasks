import * as chai from "chai"
import * as testutils from "react-addons-test-utils"
import * as React from "react"
import * as jsdom from "jsdom"
import { Header } from "../../client/common/header"

let document = jsdom.jsdom('<!doctype html><html><body></body></html>')
let window = document.defaultView

global.document = document
global.window = window

describe("Common components", () => {
    describe("Header", () => {

        it("Should create a Header", () => {
            const component = testutils.renderIntoDocument(<Header identifier="test" name="Test" />)
        })
    })
})