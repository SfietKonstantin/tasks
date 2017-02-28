import * as chai from "chai"
import * as sinon from "sinon"
import {Graph} from "../../../../server/graph/impl/graph"
import {MockDaoBuilder} from "../../dao/mockbuilder"
import {MockNodeFactory} from "./mocknodefactory"
import {project1, project2} from "../../../common/testdata"
import {MockProjectNode} from "../mockprojectnode"
import {ExistsError} from "../../../../server/error/exists"
import {get as mapGet} from "../../../../common/utils/map"


describe("Graph root", () => {
    it("Should load the graph", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        let graph = new Graph(nodeFactory, daoBuilder)

        // Mock
        const project1Node = new MockProjectNode(graph, project1.identifier)
        let mockProject1Node = sinon.mock(project1Node)
        mockProject1Node.expects("load").once()
            .withExactArgs()
            .returns(Promise.resolve())

        const project2Node = new MockProjectNode(graph, project1.identifier)
        let mockProject2Node = sinon.mock(project2Node)
        mockProject2Node.expects("load").once()
            .withExactArgs()
            .returns(Promise.resolve())

        mockNodeFactory.expects("createProjectNode").once()
            .withExactArgs(daoBuilder, graph, project1.identifier)
            .returns(project1Node)
        mockNodeFactory.expects("createProjectNode").once()
            .withExactArgs(daoBuilder, graph, project2.identifier)
            .returns(project2Node)

        daoBuilder.mockProjectDao.expects("getAllProjects").once()
            .withExactArgs()
            .returns(Promise.resolve([project1, project2]))

        return graph.load().then(() => {
            daoBuilder.verify()
            mockNodeFactory.verify()
            mockProject1Node.verify()
            mockProject2Node.verify()
        })
    })
    it("Should add a new project in the graph", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        let graph = new Graph(nodeFactory, daoBuilder)

        // Mock
        const projectNode = new MockProjectNode(graph, project1.identifier)

        daoBuilder.mockProjectDao.expects("addProject").once()
            .withExactArgs(project1).returns(Promise.resolve())
        mockNodeFactory.expects("createProjectNode").once()
            .withExactArgs(daoBuilder, graph, project1.identifier)
            .returns(projectNode)

        // Test
        return graph.addProject(project1).then(() => {
            chai.expect(mapGet(graph.projects, project1.identifier)).to.deep.equal(projectNode)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
    it("Should throw an exception when adding an existing project", () => {
        // Graph
        const daoBuilder = new MockDaoBuilder()
        const nodeFactory = new MockNodeFactory()
        let mockNodeFactory = sinon.mock(nodeFactory)
        let graph = new Graph(nodeFactory, daoBuilder)

        // Mock
        graph.projects.set(project1.identifier, new MockProjectNode(graph, project1.identifier))

        daoBuilder.mockProjectDao.expects("addProject").never()
        mockNodeFactory.expects("createProjectNode").never()

        return graph.addProject(project1).then(() => {
            throw new Error("addProject should not be a success")
        }).catch((error) => {
            chai.expect(error).to.instanceOf(ExistsError)
            daoBuilder.verify()
            mockNodeFactory.verify()
        })
    })
})
