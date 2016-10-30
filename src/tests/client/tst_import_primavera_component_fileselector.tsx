import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { FileSelector } from "../../client/imports/primavera/components/fileselector"
import { FakeFile } from "./fakefile"
import { Stage } from "../../client/imports/primavera/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera import FileSelector", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should render the component correctly", () => {
        const warnings = [
            "Warning 1",
            "Warning 2",
            "Warning 3"
        ]
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        chai.expect(component.prop("title")).to.equal("Some title")
        chai.expect(component.prop("displayStage")).to.equal(Stage.Overview)
        chai.expect(component.prop("currentStage")).to.equal(Stage.Project)
        chai.expect(component.prop("maxStage")).to.equal(Stage.Relations)

        component.simulate("current")
        chai.expect(onCurrentStage.calledOnce).to.true
        chai.expect(onCurrentStage.calledWithExactly()).to.true

        const formGroup = component.find("FormGroup")
        const cols = formGroup.find("Col")
        chai.expect(cols.at(0).children().text()).to.equal("Form label")
    })
    it("Should render the buttons correctly 1", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const buttonGroup = component.find("ButtonGroup")
        chai.expect(buttonGroup.children()).to.length(1)
        chai.expect(buttonGroup.childAt(0).children().text()).to.equal("Button text")
        chai.expect(buttonGroup.childAt(0).prop("bsStyle")).to.equal("default")
        chai.expect(buttonGroup.childAt(0).prop("disabled")).to.false

        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should render the buttons correctly 2", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const buttonGroup = component.find("ButtonGroup")
        chai.expect(buttonGroup.children()).to.length(1)
        chai.expect(buttonGroup.childAt(0).children().text()).to.equal("Button text")
        chai.expect(buttonGroup.childAt(0).prop("bsStyle")).to.equal("success")
        chai.expect(buttonGroup.childAt(0).prop("disabled")).to.false

        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        chai.expect(button.prop("disabled")).to.false
    })
    it("Should render the buttons correctly 3", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={true}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const buttonGroup = component.find("ButtonGroup")
        chai.expect(buttonGroup.children()).to.length(1)
        chai.expect(buttonGroup.childAt(0).children().text()).to.equal("Button text")
        chai.expect(buttonGroup.childAt(0).prop("bsStyle")).to.equal("default")
        chai.expect(buttonGroup.childAt(0).prop("disabled")).to.true

        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should render the buttons correctly 4", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={warnings}
                                                       isImporting={true}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const buttonGroup = component.find("ButtonGroup")
        chai.expect(buttonGroup.children()).to.length(1)
        chai.expect(buttonGroup.childAt(0).children().text()).to.equal("Button text")
        chai.expect(buttonGroup.childAt(0).prop("bsStyle")).to.equal("success")
        chai.expect(buttonGroup.childAt(0).prop("disabled")).to.true

        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        chai.expect(button.prop("disabled")).to.true
    })
    it("Should render the warning button correctly", () => {
        const warnings = [
            "Warning 1",
            "Warning 2",
            "Warning 3"
        ]
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const button = component.find("WarningsButton")
        chai.expect(button.prop("warnings")).to.deep.equal(warnings)
    })
    it("Should react to file selection", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Tasks}
                                                       currentStage={Stage.Tasks}
                                                       maxStage={Stage.Tasks}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const instance = component.instance()
        class FakeInput extends React.Component<{}, {}> {
            constructor(files: FileList) {
                super()
                this.files = files
            }
            files: FileList
            click() { throw new Error("Not mocked") }
            render() { return <div /> }
        }
        class FakeFileList implements FileList {
            readonly length: number
            constructor(file: File) {
                this[0] = file
                this.length = 1
            }
            item(index: number): File {
                return this[index]
            }
            [index: number]: File
        }
        const fakeFile = new FakeFile()
        const fakeInput = new FakeInput(new FakeFileList(fakeFile))
        const expectation = sinon.mock(fakeInput).expects("click").once()

        instance.refs = {
            "input": fakeInput
        }

        const buttonGroup = component.find("ButtonGroup")
        const button = buttonGroup.childAt(0)
        button.simulate("click")
        chai.expect(expectation.calledOnce).to.true

        // Fake the file selection
        const input = component.find("input")
        input.simulate("change")

        chai.expect(onFileSelected.calledOnce).to.true
        chai.expect(onFileSelected.calledWithExactly(fakeFile)).to.true
    })
    it("Should react to next", () => {
        const warnings = []
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Tasks}
                                                       currentStage={Stage.Tasks}
                                                       maxStage={Stage.Tasks}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage} />)
        const instance = component.instance()
        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        button.simulate("click")

        chai.expect(onNextStage.calledOnce).to.true
    })
})
