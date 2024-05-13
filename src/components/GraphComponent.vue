<template>
  <div class="toolbar">
    <div class="color-picker-wrapper">
      <input
        type="color"
        id="colorPicker"
        @input="updateNodeColor(($event.target as HTMLInputElement).value)"
        @blur="hideColorPicker"
      />
      <button class="color-picker-button" @click="triggerColorPicker">
        <img src="../assets/color-wheel.png" alt="Color Picker" />
      </button>
    </div>
    <button class="save-button" @click="handleSaveButtonClick">Save As</button>
    <input
      type="file"
      id="file"
      ref="fileInput"
      @change="handleFileChange"
      accept=".json"
      style="display: none"
    />
    <label for="file" class="file-label">Choose File</label>
    <div class="shape-selector">
      <label for="shapePicker">Node Shape:</label>
      <select
        id="shapePicker"
        v-model="selectedShape"
        @change="updateNodeShape"
      >
        <option value="rectangle">Rectangle</option>
        <option value="ellipse">Ellipse</option>
        <option value="round-rectangle">Round Rectangle</option>
        <option value="triangle">Triangle</option>
        <option value="hexagon">Hexagon</option>
      </select>
    </div>
  </div>
  <div class="graph-component" ref="gcContainer"></div>
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue'
  import type { Ref } from 'vue'
  import {
    GraphComponent,
    GraphEditorInputMode,
    IGraph,
    Point,
    Rect,
    ShapeNodeStyle,
    SolidColorFill,
    Stroke,
    ShapeNodeShape,
  } from 'yfiles'
  import { saveAs } from 'file-saver'
  import { loadGraphData } from '@/utils/graphDeserialization'

  const selectedColor = ref('#ff0000')
  const selectedShape: Ref<ShapeNodeShape> = ref(ShapeNodeShape.RECTANGLE)
  const gcContainer: Ref<HTMLDivElement | null> = ref(null)
  const graphComponent = initializeGraphComponent()
  //Create a selectedNode so we can make it just change the selected node
  //const selectedNode: Ref<INode | null> = ref(null);

  //Links:
  //https://docs.yworks.com/yfiles-html/api/GraphComponent.html
  //https://www.youtube.com/watch?v=bXFJfUBQFVg&t=208s

  //Useful lines:
  //how to loop through all the nodes: 'graphComponent.graph.nodes.forEach(node => {}'

  onMounted(() => {
    if (gcContainer.value) {
      gcContainer.value.appendChild(graphComponent.div)
      graphComponent.fitGraphBounds()
    }
  })

  onUnmounted(() => {
    if (gcContainer.value && gcContainer.value.contains(graphComponent.div)) {
      gcContainer.value.removeChild(graphComponent.div)
    }
  })

  //create the graph and call createSampleGraph to add nodes
  function initializeGraphComponent(): GraphComponent {
    const graphComponent = new GraphComponent()
    graphComponent.inputMode = new GraphEditorInputMode()
    createSampleGraph(graphComponent.graph)
    return graphComponent
  }

  //Called when graph is initialized to add some nodes to canvas
  function createSampleGraph(graph: IGraph): void {
    const nodeStyle = new ShapeNodeStyle({
      fill: selectedColor.value,
      shape: selectedShape.value,
      stroke: 'black',
    })

    //Create nodes with dynamic shape
    const node1 = graph.createNode(new Rect(30, 30, 30, 30), nodeStyle)
    const node2 = graph.createNode(new Rect(150, 30, 30, 30), nodeStyle)
    const node3 = graph.createNode(new Rect(230, 200, 60, 30), nodeStyle)
    console.log(node1.labels)
    console.log(node1.layout)
    console.log(node1.ports)
    console.log(node1.style)
    console.log(node1.tag)

    //Create some edges between the nodes
    graph.createEdge(node1, node2)
    graph.createEdge(node1, node3)
    const edge = graph.createEdge(node2, node3)
    graph.addBend(edge, new Point(260, 30))

    //.addLabel used
    graph.addLabel(node1, 'n1')
    graph.addLabel(node2, 'n2')
    graph.addLabel(node3, 'n3')
  }

  //Update node shape when btn is clicked in toolbar
  function updateNodeShape(): void {
    //Stroke() used for setting node border width and color
    graphComponent.graph.nodes.forEach((node) => {
      const shape = selectedShape.value as ShapeNodeShape
      const shapeNodeStyle = new ShapeNodeStyle({
        fill: selectedColor.value,
        stroke: new Stroke('black', 1),
        shape: shape,
      })
      graphComponent.graph.setStyle(node, shapeNodeStyle)
    })

    //This refreshes the graph with the updated changes
    graphComponent.invalidate()
  }

  // Function to handle color picker button click
  const triggerColorPicker = () => {
    const colorPicker = document.getElementById(
      'colorPicker',
    ) as HTMLInputElement | null
    if (colorPicker) {
      colorPicker.click()
    } else {
      console.log(colorPicker)
      console.log(graphComponent)
      console.error('The color picker element was not found!')
    }
  }

  // Function to handle color picker blur event
  const hideColorPicker = () => {
    const colorPicker = document.getElementById(
      'colorPicker',
    ) as HTMLInputElement | null
    if (colorPicker) {
      colorPicker.value = ''
      document.body.focus()
    }
  }

  function updateNodeColor(color: string) {
    //Update the selected color (if needed for other parts of the app)
    selectedColor.value = color

    //Create the node style with the new color
    const shapeNodeStyle = new ShapeNodeStyle({
      fill: color,
      shape: 'rectangle',
      stroke: 'black',
    })

    //Loop through nodes and update color
    graphComponent.graph.nodes.forEach((node) => {
      graphComponent.graph.setStyle(node, shapeNodeStyle)
    })

    //Refresh graph
    graphComponent.invalidate()

    console.log(`All nodes updated to the color: ${color}`)
  }

  //Function to handle saving the graph
  function handleSaveButtonClick(): void {
    const graphName = prompt('Enter a name for the graph:')
    if (!graphName) return

    //Pass graphComponent graph to serialize function
    const serializedGraphData = serializeNodes(graphComponent.graph)

    //Blob object is used to create the json file containing all node data
    //https://www.npmjs.com/package/file-saver
    const blob = new Blob([JSON.stringify(serializedGraphData)], {
      type: 'application/json',
    })

    //graphName is saved as .json
    saveAs(blob, `${graphName}.json`)
  }

  function handleFileChange(event: Event): void {
    const input = event.target as HTMLInputElement
    //check if file present
    if (input.files && input.files.length > 0) {
      //retrieve first file
      const file = input.files[0]
      console.log(file)
      const reader = new FileReader()
      reader.onload = () => {
        try {
          //parse JSON data
          const graphData = JSON.parse(reader.result as string)
          handleJsonData(graphData)
        } catch (error) {
          console.error(error)
        }
      }
      reader.readAsText(file)
    }
  }

  function handleJsonData(fileData: any): void {
    loadGraphData(graphComponent.graph, fileData)
  }

  function serializeNodes(graph: IGraph): {
    nodes: {
      id: string
      position: { x: number; y: number }
      size: { width: number; height: number }
      labels: string[]
      color: string
      shape: ShapeNodeShape
    }[]
    edges: {
      source: string
      target: string
    }[]
  } {
    //create the array which we will store node/edge information in
    const serializedNodes: {
      id: string
      position: { x: number; y: number }
      size: { width: number; height: number }
      labels: string[]
      color: string
      shape: ShapeNodeShape
    }[] = []
    const serializedEdges: {
      source: string
      target: string
    }[] = []

    // Iterate over each node in the graph
    graph.nodes.forEach((node, index) => {
      // Extract node properties
      const nodeId = `node_${index}`
      const layout = node.layout
      const position = { x: layout.x, y: layout.y }
      const size = { width: layout.width, height: layout.height }
      const labels: string[] = []
      node.labels.forEach((label) => {
        labels.push(label.text)
      })

      // Extract color and shape information from node style
      const fillColor = ((node.style as ShapeNodeStyle)?.fill as SolidColorFill)
        ?.color
      const fill = fillColor
        ? `rgba(${fillColor.r}, ${fillColor.g}, ${fillColor.b}, ${fillColor.a})`
        : ''
      const shape = (node.style as ShapeNodeStyle).shape

      //store serialized node information
      const serializedNode = {
        id: nodeId,
        position: position,
        size: size,
        labels: labels,
        color: fill,
        shape: shape,
      }

      //add the node to the array
      serializedNodes.push(serializedNode)
    })

    //same thing as nodes but now for the edges
    graph.edges.forEach((edge) => {
      const sourceId = `node_${graph.nodes.indexOf(edge.sourceNode)}`
      const targetId = `node_${graph.nodes.indexOf(edge.targetNode)}`

      const serializedEdge = {
        source: sourceId,
        target: targetId,
      }

      //append to the arrayu
      serializedEdges.push(serializedEdge)
    })

    return {
      nodes: serializedNodes,
      edges: serializedEdges,
    }
  }
</script>

<style scoped>
  .toolbar {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: #f0f0f0;
    padding: 10px 20px;
    margin-bottom: 10px;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .graph-component {
    width: 1000px;
    max-width: 1000px;
    height: 750px;
    border: 5px solid #757575;
    border-radius: 25px;
    margin: auto;
    background-color: whitesmoke;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .graph-component :deep(.yfiles-canvascomponent) {
    width: 100%;
    height: 100%;
  }

  .save-button,
  .file-label {
    background-color: var(--primary-color);
    color: rgb(255, 255, 255);
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition:
      background-color 0.3s,
      box-shadow 0.3s;
  }

  .save-button {
    background-color: #ffffff;
    color: #333;
    border: 2px solid #007bff;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .save-button:hover {
    background-color: #007bff;
    color: white;
    border-color: #0056b3;
    box-shadow:
      0 2px 5px rgba(0, 0, 0, 0.24),
      0 2px 10px rgba(0, 0, 0, 0.19);
  }

  input[type='color'],
  input[type='file'] {
    border: 2px solid var(--secondary-color);
    padding: 10px;
    border-radius: 5px;
    transition: border-color 0.3s;
  }

  input[type='color']:focus,
  input[type='file']:focus {
    border-color: var(--primary-color);
  }

  .file-label {
    background-color: #008cba;
  }

  .file-label:hover {
    background-color: #007bb5;
  }

  .color-picker-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-picker-button {
    background: none;
    border: none;
    cursor: pointer;
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius: 50%;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
  }

  .color-picker-button img {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 50%;
  }

  .color-picker-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  #colorPicker {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }
</style>
