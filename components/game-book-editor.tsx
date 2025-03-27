"use client";

import type React from "react";

import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  EdgeLabelRenderer,
  getBezierPath,
} from "reactflow";
import "reactflow/dist/style.css";
import { PageNode } from "./page-node";
import { ChoiceNode } from "./choice-node";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowRightFromLine,
  Download,
  Upload,
  RefreshCw,
  ZoomIn,
  Flag,
  X,
  Image,
  Trash,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Define custom node types
const nodeTypes: NodeTypes = {
  page: PageNode,
  choice: ChoiceNode,
};

// Custom edge with delete button
function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
}: any) {
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    if (window.confirm("Are you sure you want to delete this connection?")) {
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrow)"
        style={{
          ...style,
          stroke: "#6366f1",
          strokeWidth: 2.5,
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zindex: 10,
            }}
            className="nodrag nopan"
          >
            <button
              className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-slate-200 shadow-md hover:bg-rose-50 hover:text-rose-500 transition-colors"
              onClick={(event) => onEdgeClick(event, id)}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

// Define custom edge types
const edgeTypes = {
  custom: CustomEdge,
};

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "1",
    type: "page",
    position: { x: 250, y: 100 },
    data: {
      title: "Start Page",
      content: "<p>Your adventure begins here...</p>",
      width: 360, // Increased by 20% from 300
      height: 200,
      isStartNode: true,
      image: null,
    },
  },
];

const initialEdges: Edge[] = [];

export default function GameBookEditor() {
  return (
    <ReactFlowProvider>
      <GameBookEditorContent />
    </ReactFlowProvider>
  );
}

function GameBookEditorContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeContent, setNodeContent] = useState("");
  const [nodeImage, setNodeImage] = useState<string | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Update form fields when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeTitle(selectedNode.data.title || "");
      setNodeContent(selectedNode.data.content || "");
      setNodeImage(selectedNode.data.image || null);
    }
  }, [selectedNode]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params: Connection) => {
      // Check if the connection is valid
      const sourceNode = nodes.find((node) => node.id === params.source);
      const targetNode = nodes.find((node) => node.id === params.target);

      if (!sourceNode || !targetNode) return;

      // Add the new edge with arrow marker and custom type
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "custom",
            style: { stroke: "#6366f1", strokeWidth: 2.5, zindex: 9999 },
          },
          eds
        )
      );
    },
    [nodes, setEdges]
  );

  // Handle node deletion
  const onNodesDelete = useCallback(
    (nodesToDelete: Node[]) => {
      // Prevent deletion of start node
      const filteredNodesToDelete = nodesToDelete.filter(
        (node) => !node.data.isStartNode
      );

      if (filteredNodesToDelete.length !== nodesToDelete.length) {
        alert("The start page cannot be deleted.");
      }

      if (filteredNodesToDelete.length === 0) return;

      // Also delete connected edges when a node is deleted
      const nodeIdsToDelete = filteredNodesToDelete.map((node) => node.id);
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodeIdsToDelete.includes(edge.source) &&
            !nodeIdsToDelete.includes(edge.target)
        )
      );

      // Clear selected node if it was deleted
      if (selectedNode && nodeIdsToDelete.includes(selectedNode.id)) {
        setSelectedNode(null);
      }

      // Remove the nodes
      setNodes((nodes) =>
        nodes.filter((node) => !nodeIdsToDelete.includes(node.id))
      );
    },
    [setEdges, selectedNode, setNodes]
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      // Clear selected edge if it was deleted
      if (
        selectedEdge &&
        edgesToDelete.some((edge) => edge.id === selectedEdge.id)
      ) {
        setSelectedEdge(null);
      }
    },
    [selectedEdge]
  );

  // Convert existing edges to custom type with delete button
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: "custom",
        style: { stroke: "#6366f1", strokeWidth: 2.5, zindex: 9999 },
      }))
    );
  }, []);

  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  // Handle edge selection
  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  // Add a new page node
  const addPageNode = () => {
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowWrapper.current!.clientWidth / 2,
      y: reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: uuidv4(),
      type: "page",
      position: position,
      data: {
        title: "New Page",
        content: "<p>Add your content here...</p>",
        width: 360, // Increased by 20% from 300
        height: 200,
        isStartNode: false,
        isEndNode: false,
        image: null,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Add a new end page node
  const addEndPageNode = () => {
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowWrapper.current!.clientWidth / 2,
      y: reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: uuidv4(),
      type: "page",
      position: position,
      data: {
        title: "End Page",
        content: "<p>Your adventure ends here...</p>",
        width: 360, // Increased by 20% from 300
        height: 200,
        isStartNode: false,
        isEndNode: true,
        image: null,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Add a new choice node
  const addChoiceNode = () => {
    const position = reactFlowInstance.screenToFlowPosition({
      x: reactFlowWrapper.current!.clientWidth / 2,
      y: reactFlowWrapper.current!.clientHeight / 2,
    });

    const newNode: Node = {
      id: uuidv4(),
      type: "choice",
      position: position,
      data: {
        title: "New Choice",
        content: "<p>Describe the choice here...</p>",
        width: 250,
        height: 150,
        image: null,
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  // Update node data
  const updateNodeData = () => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              title: nodeTitle,
              content: nodeContent,
              image: nodeImage,
            },
          };
          // Also update the selected node reference
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodeTitle(e.target.value);
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    setNodeContent(content);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setNodeImage(base64String);

      // Auto-apply the image to the node
      if (selectedNode) {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id === selectedNode.id) {
              const updatedNode = {
                ...node,
                data: {
                  ...node.data,
                  image: base64String,
                },
              };
              // Also update the selected node reference
              setSelectedNode(updatedNode);
              return updatedNode;
            }
            return node;
          })
        );
      }
    };
    reader.readAsDataURL(file);

    // Reset the file input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  // Handle image deletion
  const handleImageDelete = () => {
    setNodeImage(null);

    // Apply the change to the node
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                image: null,
              },
            };
            // Also update the selected node reference
            setSelectedNode(updatedNode);
            return updatedNode;
          }
          return node;
        })
      );
    }
  };

  // Trigger image upload
  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  // Apply changes when input/textarea loses focus or on Enter key
  const handleBlur = () => {
    updateNodeData();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      updateNodeData();
    }
  };

  // Handle pane click to deselect nodes and edges
  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  // Delete a node by ID
  const deleteNode = (nodeId: string) => {
    // Check if this is the start node
    const nodeToDelete = nodes.find((node) => node.id === nodeId);
    if (nodeToDelete?.data.isStartNode) {
      alert("The start page cannot be deleted.");
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== nodeId));

    // Also delete connected edges
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );

    // Clear selected node if it was deleted
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Delete an edge by ID
  const deleteEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));

    // Clear selected edge if it was deleted
    if (selectedEdge && selectedEdge.id === edgeId) {
      setSelectedEdge(null);
    }
  };

  // Reset the canvas
  const resetCanvas = () => {
    if (
      window.confirm(
        "Are you sure you want to reset the canvas? All unsaved changes will be lost."
      )
    ) {
      setNodes(initialNodes);
      setEdges(initialEdges);
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  };

  // Export the game book to JSON
  const exportToJson = () => {
    // Create a map of nodes by ID for easy lookup
    const nodesMap = new Map(nodes.map((node) => [node.id, node]));

    // Process nodes to create denormalized structure
    const processedNodes = nodes.map((node) => {
      const nodeData: any = {
        id: node.id,
        type: node.type,
        title: node.data.title,
        content: node.data.content,
        position: node.position,
        width: node.data.width,
        height: node.data.height,
      };

      // Add image if present
      if (node.data.image) {
        nodeData.image = node.data.image;
      }

      // Add special node flags if present
      if (node.data.isStartNode) {
        nodeData.isStartNode = true;
      }

      if (node.data.isEndNode) {
        nodeData.isEndNode = true;
      }

      // For page nodes, add array of outgoing choice IDs
      if (node.type === "page" && !node.data.isEndNode) {
        // Find all edges where this node is the source
        const outgoingEdges = edges.filter((edge) => edge.source === node.id);
        // Get the target nodes of these edges
        const outgoingNodes = outgoingEdges
          .map((edge) => nodesMap.get(edge.target))
          .filter(Boolean);

        // Add array of choice IDs (only if the target is a choice node)
        nodeData.choices = outgoingNodes
          .filter((targetNode) => targetNode?.type === "choice")
          .map((targetNode) => targetNode?.id);
      }

      // For choice nodes, add the destination node ID
      if (node.type === "choice") {
        // Find edges where this choice is the source
        const outgoingEdges = edges.filter((edge) => edge.source === node.id);
        // Get the first target node (a choice should only have one destination)
        if (outgoingEdges.length > 0) {
          const destinationNode = nodesMap.get(outgoingEdges[0].target);
          if (destinationNode) {
            nodeData.destination = destinationNode.id;
          }
        }
      }

      return nodeData;
    });

    const gameBookData = {
      nodes: processedNodes,
      edges: edges,
    };

    const jsonString = JSON.stringify(gameBookData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "game-book.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const importJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        // Check if the JSON has the expected structure
        if (!jsonData.nodes || !Array.isArray(jsonData.nodes)) {
          throw new Error("Invalid JSON format: missing nodes array");
        }

        // Process imported nodes
        const importedNodes = jsonData.nodes.map((node: any) => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: {
            title: node.title,
            content: node.content || "<p>No content</p>",
            width: node.width || (node.type === "page" ? 360 : 250),
            height: node.height || (node.type === "page" ? 200 : 150),
            isStartNode: node.isStartNode || false,
            isEndNode: node.isEndNode || false,
            image: node.image || null,
          },
        }));

        // Process imported edges
        let importedEdges: Edge[] = [];

        // If the JSON has edges, use them directly
        if (jsonData.edges && Array.isArray(jsonData.edges)) {
          importedEdges = jsonData.edges.map((edge: Edge) => ({
            ...edge,
            type: "custom",
            style: { stroke: "#6366f1", strokeWidth: 2.5, zindex: 9999 },
          }));
        }
        // Otherwise, reconstruct edges from the denormalized structure
        else {
          // Create edges from page choices
          jsonData.nodes.forEach((node: any) => {
            if (
              node.type === "page" &&
              node.choices &&
              Array.isArray(node.choices)
            ) {
              node.choices.forEach((choiceId: string) => {
                importedEdges.push({
                  id: `e-${node.id}-${choiceId}`,
                  source: node.id,
                  target: choiceId,
                  type: "custom",
                  style: { stroke: "#6366f1", strokeWidth: 2.5, zindex: 9999 },
                });
              });
            }

            // Create edges from choice destinations
            if (node.type === "choice" && node.destination) {
              importedEdges.push({
                id: `e-${node.id}-${node.destination}`,
                source: node.id,
                target: node.destination,
                type: "custom",
                style: { stroke: "#6366f1", strokeWidth: 2.5, zindex: 9999 },
              });
            }
          });
        }

        // Update the canvas with imported data
        setNodes(importedNodes);
        setEdges(importedEdges);

        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Fit the view to show all imported nodes
        setTimeout(() => {
          reactFlowInstance.fitView();
        }, 100);
      } catch (error) {
        console.error("Error importing JSON:", error);
        alert("Failed to import JSON file. Please check the file format.");
      }
    };

    reader.readAsText(file);
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex h-[80vh] w-full flex-col md:flex-row">
      <div
        className="h-full w-full border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          deleteKeyCode={["Backspace", "Delete"]}
          edgeUpdaterRadius={10}
          onEdgeUpdate={(oldEdge, newConnection) => {
            setEdges((els) =>
              els.map((el) =>
                el.id === oldEdge.id
                  ? { ...el, ...newConnection, type: "custom" }
                  : el
              )
            );
          }}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          nodesDraggable={true}
          minZoom={0.1}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          // Enable connecting to nodes by hovering over them
          connectOnClick={false}
          connectionRadius={40}
          elevateEdgesOnSelect={true}
          zindex={0} // This forces edges to be on top of nodes
          proOptions={{ hideAttribution: true }}
        >
          {/* Custom arrow marker definition */}
          <svg style={{ position: "absolute", top: 0, left: 0 }}>
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
              </marker>
            </defs>
          </svg>

          <Controls className="bg-white border border-slate-200 rounded-md shadow-sm">
            <button
              className="react-flow__controls-button"
              onClick={() => {
                const startNode = nodes.find((node) => node.data.isStartNode);
                if (startNode) {
                  reactFlowInstance.setCenter(
                    startNode.position.x,
                    startNode.position.y,
                    { duration: 800 }
                  );
                }
              }}
              title="Go to Start Page"
            >
              <BookOpen className="h-4 w-4" />
            </button>
          </Controls>
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            draggable
            maskColor="rgba(0, 0, 0, 0.1)"
            className="bg-white border border-slate-200 rounded-md shadow-sm"
            nodeColor={(node) => {
              if (node.type === "choice") return "#8b5cf6";
              if (node.data.isStartNode) return "#10b981";
              if (node.data.isEndNode) return "#f43f5e";
              return "#6366f1";
            }}
          />
          <Background gap={16} size={1} color="#e2e8f0" />
          <Panel position="top-right">
            <div className="flex gap-2 flex-wrap bg-white p-2 rounded-md shadow-sm border border-slate-200">
              <Button
                onClick={addPageNode}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
              >
                <BookOpen className="h-4 w-4" />
                Add Page
              </Button>
              <Button
                onClick={addEndPageNode}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-rose-50 hover:text-rose-600 border-slate-200"
              >
                <Flag className="h-4 w-4" />
                Add End Page
              </Button>
              <Button
                onClick={addChoiceNode}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-violet-50 hover:text-violet-600 border-slate-200"
              >
                <ArrowRightFromLine className="h-4 w-4" />
                Add Choice
              </Button>
              <Button
                onClick={exportToJson}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                onClick={handleImportClick}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200"
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              <Button
                onClick={resetCanvas}
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={importJson}
                accept=".json"
                className="hidden"
              />
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {selectedNode && (
        <div className="w-full md:w-1/3 p-4 border-l border-slate-200 overflow-auto bg-white">
          <h3 className="text-lg font-medium mb-4 text-slate-800">
            Edit {selectedNode.type === "page" ? "Page" : "Choice"}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Title
              </label>
              <input
                type="text"
                value={nodeTitle}
                onChange={handleTitleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Content
              </label>
              <RichTextEditor
                content={nodeContent}
                onChange={handleContentChange}
              />
              <Button
                onClick={updateNodeData}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Apply Changes
              </Button>
            </div>

            {/* Image section */}
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700">
                Image
              </label>
              <div className="flex flex-col gap-2">
                {nodeImage ? (
                  <div className="relative border border-slate-200 rounded-md p-2">
                    <img
                      src={nodeImage || "/placeholder.svg"}
                      alt="Node image"
                      className="max-w-full max-h-[150px] object-contain mx-auto"
                    />
                    <Button
                      onClick={handleImageDelete}
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 h-7 w-7 p-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-md p-6 bg-slate-50">
                    <Image className="h-8 w-8 text-slate-400 mb-2" />
                    <p className="text-sm text-slate-500 mb-2">
                      No image uploaded
                    </p>
                    <Button
                      onClick={triggerImageUpload}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-indigo-50 hover:text-indigo-600 border-slate-200"
                    >
                      Upload Image
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex justify-between">
              {!selectedNode.data.isStartNode && (
                <Button
                  onClick={() => deleteNode(selectedNode.id)}
                  variant="destructive"
                  className="mt-2 bg-rose-600 hover:bg-rose-700"
                >
                  Delete Node
                </Button>
              )}
            </div>
            <div>
              <p className="text-sm text-slate-500">
                Node ID: {selectedNode.id}
              </p>
              <p className="text-sm text-slate-500">
                Type: {selectedNode.type === "page" ? "Page" : "Choice"}
              </p>
              <p className="text-sm text-slate-500">
                Dimensions: {selectedNode.data.width}px ×{" "}
                {selectedNode.data.height}px
              </p>
              {selectedNode.data.isStartNode && (
                <p className="text-sm text-emerald-600 font-medium">
                  This is the start page and cannot be deleted
                </p>
              )}
              {selectedNode.data.isEndNode && (
                <p className="text-sm text-rose-600 font-medium">
                  This is an end page (no outgoing connections)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedEdge && !selectedNode && (
        <div className="w-full md:w-1/3 p-4 border-l border-slate-200 bg-white">
          <h3 className="text-lg font-medium mb-4 text-slate-800">
            Edit Connection
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">
                Connection ID: {selectedEdge.id}
              </p>
              <p className="text-sm text-slate-500">
                From: {selectedEdge.source}
              </p>
              <p className="text-sm text-slate-500">
                To: {selectedEdge.target}
              </p>
            </div>
            <div>
              <Button
                onClick={() => deleteEdge(selectedEdge.id)}
                variant="destructive"
                className="mt-2 bg-rose-600 hover:bg-rose-700"
              >
                Delete Connection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
