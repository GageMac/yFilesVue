import { IGraph, Rect, ShapeNodeStyle } from 'yfiles'

export function loadGraphData(graph: IGraph, graphData: any): void {
  graph.clear()

  const idToNodeMap = new Map<string, any>() //Map to store node references by ID

  //Iterate over nodes in the graph data
  graphData.nodes.forEach((nodeData: any) => {
    //create a new node at the specified position
    const node = graph.createNode(
      new Rect(
        nodeData.position.x,
        nodeData.position.y,
        nodeData.size.width,
        nodeData.size.height,
      ),
    )
    console.log(node)
    //add labels to the node
    nodeData.labels.forEach((label: string) => {
      graph.addLabel(node, label)
    })

    //store node reference by ID
    idToNodeMap.set(nodeData.id, node)

    //apply color and shape information to the node style
    const nodeStyle = new ShapeNodeStyle({
      fill: nodeData.color, 
      shape: nodeData.shape, 
      stroke: 'black',
    })
    console.log('Serialized node color:', nodeData.color)
    graph.setStyle(node, nodeStyle)
  })

  //Iterate over edges in the graph data
  graphData.edges.forEach((edgeData: any) => {
    const sourceNode = idToNodeMap.get(edgeData.source)
    const targetNode = idToNodeMap.get(edgeData.target)

    if (sourceNode && targetNode) {
      graph.createEdge(sourceNode, targetNode)
    }
  })
}
