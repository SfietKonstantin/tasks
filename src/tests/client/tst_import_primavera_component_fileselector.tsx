import * as chai from "chai"
import * as React from "react"
import * as enzyme from "enzyme"
import * as sinon from "sinon"
import { FileSelector } from "../../client/imports/primavera/components/fileselector"
import { FakeFile } from "./fakefile"
import { Stage } from "../../client/imports/primavera/types"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { expectMapEqual } from "./expectutils"
import { warnings, noWarnings } from "./testdata"

describe("Primavera import FileSelector", () => {
    beforeEach(() => {
        addFakeGlobal()
    })
    afterEach(() => {
        clearFakeGlobal()
    })
    it("Should render the component correctly", () => {
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={noWarnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={noWarnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={noWarnings}
                                                       isImporting={true}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={123}
                                                       warnings={noWarnings}
                                                       isImporting={true}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={warnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
        const button = component.find("WarningsButton")
        expectMapEqual(button.prop("warnings"), warnings)
    })
    it("Should render the error alert correctly", () => {
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Overview}
                                                       currentStage={Stage.Project}
                                                       maxStage={Stage.Relations}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={noWarnings}
                                                       isImporting={true}
                                                       isInvalidFormat={true}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
        const alert = component.find("Alert")
        chai.expect(alert.children().text()).to.equal("Invalid file format")

        alert.simulate("dismiss")

        chai.expect(onDismissInvalidFormat.calledOnce).to.true
        chai.expect(onDismissInvalidFormat.calledWithExactly()).to.true
    })
    it("Should react to file selection", () => {
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Tasks}
                                                       currentStage={Stage.Tasks}
                                                       maxStage={Stage.Tasks}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={noWarnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
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
        const onFileSelected = sinon.spy()
        const onCurrentStage = sinon.spy()
        const onNextStage = sinon.spy()
        const onDismissInvalidFormat = sinon.spy()
        const component = enzyme.shallow(<FileSelector displayStage={Stage.Tasks}
                                                       currentStage={Stage.Tasks}
                                                       maxStage={Stage.Tasks}
                                                       title="Some title"
                                                       formLabel="Form label"
                                                       buttonText="Button text"
                                                       itemCount={0}
                                                       warnings={noWarnings}
                                                       isImporting={false}
                                                       isInvalidFormat={false}
                                                       onFileSelected={onFileSelected}
                                                       onCurrentStage={onCurrentStage}
                                                       onNextStage={onNextStage}
                                                       onDismissInvalidFormat={onDismissInvalidFormat} />)
        const instance = component.instance()
        const buttons = component.find("Button")
        const button = buttons.at(buttons.length - 1)
        button.simulate("click")

        chai.expect(onNextStage.calledOnce).to.true
    })
})
