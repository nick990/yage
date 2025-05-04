"use client";

import type React from "react";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  useReactFlow,
  ReactFlowProvider,
  EdgeLabelRenderer,
  getBezierPath,
  ControlButton,
} from "reactflow";
import "reactflow/dist/style.css";
import { PageNode } from "./nodes/page-node";
import { ChoiceNode } from "./nodes/choice-node";
import { RichTextEditor } from "./rich-text-editor";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowRightFromLine,
  Download,
  Upload,
  RefreshCw,
  Flag,
  X,
  Image,
  Trash,
  File,
  ChevronDown,
  Share2,
  Play,
  Square,
  Users,
  ArrowLeft,
  Target,
  Milestone as MilestoneIcon,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CharactersSidebar } from "./sidebars/characters-sidebar";
import { Character } from "@/models/character";
import { Milestone } from "@/models/milestone";
import { MilestonesSidebar } from "./sidebars/milestones-sidebar";
import { PageSidebar } from "./sidebars/page-sidebar";
import { ChoiceSidebar } from "./sidebars/choice-sidebar";

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

  const onEdgeDeleteClick = (evt: React.MouseEvent, id: string) => {
    evt.stopPropagation();
    if (window.confirm("Are you sure you want to delete this connection?")) {
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    }
  };

  return (
    <>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
        </marker>
      </defs>
      {/* Invisible wider path for easier selection */}
      <path
        id={`${id}-selection`}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          ...style,
          stroke: "transparent",
          strokeWidth: 20,
          cursor: "pointer",
        }}
      />
      {/* Visible edge path */}
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrow)"
        style={{
          ...style,
          stroke: selected ? "#4f46e5" : "#6366f1",
          strokeWidth: selected ? 3.5 : 2.5,
          cursor: "pointer",
        }}
      />
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: "all",
              zIndex: 10000,
            }}
            className="nodrag nopan"
          >
            <button
              className="flex items-center justify-center w-12 h-12 rounded-full bg-white/100 border border-slate-200 shadow-md hover:bg-rose-50 hover:text-rose-500 transition-colors z-[10000] relative"
              onClick={(event) => onEdgeDeleteClick(event, id)}
            >
              <Trash className="w-8 h-8" />
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [nodeTitle, setNodeTitle] = useState("");
  const [nodeContent, setNodeContent] = useState("");
  const [nodeImage, setNodeImage] = useState<string | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [nodeCharacter, setNodeCharacter] = useState<Character | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [isPlayMode, setIsPlayMode] = useState(false);
  const [isCharactersSidebarVisible, setIsCharactersSidebarVisible] =
    useState(false);
  const [isMilestonesSidebarVisible, setIsMilestonesSidebarVisible] =
    useState(false);

  // Trova il nodo selezionato
  const selectedNode = nodes.find((node) => node.selected) || null;

  // Trova la pagina iniziale
  const startPage = nodes.find((node) => node.data.isStartNode);

  // Memoize edgeTypes
  const memoizedEdgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  // Update form fields when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setNodeTitle(selectedNode.data.title || "");
      setNodeContent(selectedNode.data.content || "");
      setNodeImage(selectedNode.data.image || null);
      setNodeCharacter(selectedNode.data.character || null);
    }
  }, [selectedNode, characters, milestones]);

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
            style: { stroke: "#6366f1", strokeWidth: 2.5, zIndex: 9999 },
          },
          eds
        )
      );
    },
    [nodes, setEdges]
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

  useEffect(() => {
    updateNodeCharacters();
  }, [characters]);

  // Handle node selection
  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedEdge(null);
  };

  // Handle edge selection
  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
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
  const updateNodeCharacters = () => {
    setNodes((nds) =>
      nds.map((node) => {
        // Se il nodo ha un personaggio associato
        if (node.data.character) {
          const nodeCharacterId = node.data.character.id;
          // Cerca se il personaggio esiste ancora nella lista dei personaggi
          const character = characters.find((c) => c.id === nodeCharacterId);
          // Se il personaggio non esiste più
          if (!character) {
            return {
              ...node,
              data: {
                ...node.data,
                character: null, // Rimuovi il riferimento al personaggio
              },
            };
          } else {
            // Se il nodo non ha un personaggio associato, cerca il personaggio nella lista dei personaggi
            return {
              ...node,
              data: {
                ...node.data,
                character: character,
              },
            };
          }
        } else {
          return node;
        }
      })
    );
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
              character: nodeCharacter,
            },
          };
          return updatedNode;
        }
        return node;
      })
    );
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setNodeTitle(newTitle);
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                title: newTitle,
              },
            };
            return updatedNode;
          }
          return node;
        })
      );
    }
  };

  // Handle content change
  const handleContentChange = (content: string) => {
    setNodeContent(content);
    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                content: content,
              },
            };
            return updatedNode;
          }
          return node;
        })
      );
    }
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
    setSelectedEdge(null);
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
      setSelectedEdge(null);
    }
  };

  // Export the game book to JSON
  const saveToJson = () => {
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

      // Add character ID if present
      if (node.data.character) {
        nodeData.characterId = node.data.character.id;
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
      characters: characters,
      milestones: milestones,
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

  // Export game book to simplified JSON format
  const exportToJson = () => {
    // Create maps for quick lookups
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));
    const incomingEdgesMap = new Map<string, string[]>();
    const outgoingEdgesMap = new Map<string, string[]>();

    // Build edge maps
    edges.forEach((edge) => {
      // Incoming edges
      if (!incomingEdgesMap.has(edge.target)) {
        incomingEdgesMap.set(edge.target, []);
      }
      incomingEdgesMap.get(edge.target)?.push(edge.source);

      // Outgoing edges
      if (!outgoingEdgesMap.has(edge.source)) {
        outgoingEdgesMap.set(edge.source, []);
      }
      outgoingEdgesMap.get(edge.source)?.push(edge.target);
    });

    // Process pages
    const pages = nodes
      .filter((node) => node.type === "page")
      .map((node) => ({
        id: node.id,
        title: node.data.title,
        content: node.data.content,
        image: node.data.image,
        isStartNode: node.data.isStartNode,
        isEndNode: node.data.isEndNode,
        characterId: node.data.character?.id,
        incomingChoices:
          incomingEdgesMap
            .get(node.id)
            ?.filter((id) => nodeMap.get(id)?.type === "choice") || [],
        outgoingChoices:
          outgoingEdgesMap
            .get(node.id)
            ?.filter((id) => nodeMap.get(id)?.type === "choice") || [],
      }));

    // Process choices
    const choices = nodes
      .filter((node) => node.type === "choice")
      .map((node) => ({
        id: node.id,
        title: node.data.title,
        content: node.data.content,
        image: node.data.image,
        characterId: node.data.character?.id,
        incomingPages:
          incomingEdgesMap
            .get(node.id)
            ?.filter((id) => nodeMap.get(id)?.type === "page") || [],
        outgoingPage:
          outgoingEdgesMap
            .get(node.id)
            ?.find((id) => nodeMap.get(id)?.type === "page") || null,
      }));

    const gameBookData = {
      pages,
      choices,
      characters,
    };

    const jsonString = JSON.stringify(gameBookData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "game-book-export.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON file
  const loadFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
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
        if (!jsonData.edges || !Array.isArray(jsonData.edges)) {
          throw new Error("Invalid JSON format: missing edges array");
        }
        if (!jsonData.characters || !Array.isArray(jsonData.characters)) {
          throw new Error("Invalid JSON format: missing characters array");
        }
        if (!jsonData.milestones || !Array.isArray(jsonData.milestones)) {
          throw new Error("Invalid JSON format: missing milestones array");
        }

        // Set characters
        setCharacters(jsonData.characters);

        // Set milestones
        setMilestones(jsonData.milestones);

        // Create a map of characters by ID for quick lookup
        const charactersMap = new Map(
          jsonData.characters.map((char: Character) => [char.id, char])
        );

        // Process imported nodes
        const importedNodes = jsonData.nodes.map((node: any) => {
          const nodeData: any = {
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
          };

          // If the node has a characterId, find and assign the corresponding character object
          if (node.characterId) {
            const character = charactersMap.get(node.characterId);
            if (character) {
              nodeData.data.character = character;
            }
          }

          return nodeData;
        });

        // Process imported edges
        const importedEdges = jsonData.edges.map((edge: Edge) => ({
          ...edge,
          type: "custom",
          style: { stroke: "#636f1", strokeWidth: 2.5, zIndex: 9999 },
        }));

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

  // Inizia il play mode
  const startPlayMode = (fromStart: boolean = true) => {
    const startingPage = fromStart ? startPage : selectedNode;
    if (startingPage) {
      setCurrentPageId(startingPage.id);
      setIsPlayMode(true);
      navigateToPage(startingPage.id);
    }
  };

  const navigateToCurrentPage = () => {
    navigateToPage(selectedNode!.id);
  };

  const navigateToStartPage = () => {
    navigateToPage(startPage!.id);
  };

  // Gestisce la navigazione tra le pagine
  const navigateToPage = (targetNodeId: string) => {
    setCurrentPageId(targetNodeId);
    // Aggiungi la pagina alla cronologia
    setPageHistory((prev) => [...prev, targetNodeId]);
    // Scroll to top
    const sidebar = document.querySelector(".overflow-auto");
    if (sidebar) {
      sidebar.scrollTop = 0;
    }

    // Centra la vista sul nodo corrente mantenendo lo zoom
    const targetNode = nodes.find((node) => node.id === targetNodeId);
    if (targetNode) {
      const { zoom } = reactFlowInstance.getViewport();
      reactFlowInstance.setCenter(
        targetNode.position.x,
        targetNode.position.y + 200,
        { duration: 800, zoom }
      );
    }
  };

  // Torna alla pagina precedente
  const goBack = () => {
    if (pageHistory.length > 1) {
      const previousPage = pageHistory[pageHistory.length - 2];
      setPageHistory((prev) => prev.slice(0, -1));
      setCurrentPageId(previousPage);

      // Centra la vista sulla pagina precedente
      const targetNode = nodes.find((node) => node.id === previousPage);
      if (targetNode) {
        const { zoom } = reactFlowInstance.getViewport();
        reactFlowInstance.setCenter(
          targetNode.position.x,
          targetNode.position.y + 200,
          { duration: 800, zoom }
        );
      }
    }
  };

  // Trova le scelte disponibili per la pagina corrente
  const getAvailableChoices = () => {
    if (!currentPageId) return [];

    const currentPage = nodes.find((node) => node.id === currentPageId);
    if (!currentPage) return [];

    // Trova tutti i nodi choice collegati a questa pagina
    const choiceEdges = edges.filter((edge) => edge.source === currentPageId);
    return choiceEdges
      .map((edge) => {
        const choiceNode = nodes.find((node) => node.id === edge.target);
        return choiceNode;
      })
      .filter(Boolean);
  };

  // Trova la pagina di destinazione per una scelta
  const getDestinationPage = (choiceId: string) => {
    const choiceEdge = edges.find((edge) => edge.source === choiceId);
    if (!choiceEdge) return null;

    return nodes.find((node) => node.id === choiceEdge.target);
  };

  function handleMilestonesClick() {
    setIsMilestonesSidebarVisible((prev) => !prev); // Toggle visibility
  }

  function handleCharactersClick() {
    setIsCharactersSidebarVisible((prev) => !prev); // Toggle visibility
  }

  const handleCharacterChange = (characterId: string) => {
    const selectedCharacter = characters.find(
      (char) => char.id === characterId
    );
    setNodeCharacter(selectedCharacter!);

    if (selectedNode) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                character: selectedCharacter,
                image: selectedCharacter ? null : node.data.image, // Rimuovi l'immagine se c'è un character
              },
            };
          }
          return node;
        })
      );
    }
  };

  const handleDeselectNode = () => {
    const pane = document.querySelector(".react-flow__pane");
    if (pane) {
      (pane as HTMLElement).click();
    }
  };

  return (
    <div className="flex h-[80vh] w-full flex-col">
      {/* Barra dei comandi */}
      <div className="flex gap-2 p-1 bg-white border-b border-slate-200">
        <Button
          onClick={addPageNode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
        >
          <BookOpen className="h-4 w-4" />
          Add Page
        </Button>
        <Button
          onClick={addEndPageNode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
        >
          <Flag className="h-4 w-4" />
          Add End Page
        </Button>
        <Button
          onClick={addChoiceNode}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
        >
          <ArrowRightFromLine className="h-4 w-4" />
          Add Choice
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
            >
              <Play className="h-4 w-4" />
              Play
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => startPlayMode()}
              disabled={isPlayMode}
              className="flex items-center gap-2"
            >
              <Flag className="h-4 w-4" />
              from Start
              {isPlayMode && (
                <span className="text-xs text-slate-400 ml-1">
                  (stop current play first)
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                startPlayMode(false);
              }}
              disabled={
                isPlayMode || !selectedNode || selectedNode.type !== "page"
              }
              className="flex items-center gap-2"
            >
              <ArrowRightFromLine className="h-4 w-4" />
              from Selected
              {(!selectedNode || selectedNode.type !== "page") && (
                <span className="text-xs text-slate-400 ml-1">
                  (select a page first)
                </span>
              )}
              {isPlayMode && (
                <span className="text-xs text-slate-400 ml-1">
                  (stop current play first)
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setIsPlayMode(false);
              }}
              disabled={!isPlayMode}
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={handleCharactersClick}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
        >
          <Users className="h-4 w-4" />
          Characters
        </Button>
        <Button
          onClick={handleMilestonesClick}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
        >
          <MilestoneIcon className="h-4 w-4" />
          Milestones
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white hover:bg-slate-50 border-slate-200"
            >
              <File className="h-4 w-4" />
              File
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={saveToJson}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Save
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleImportClick}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Load
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={exportToJson}
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={resetCanvas}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input
          type="file"
          ref={fileInputRef}
          onChange={loadFromJson}
          accept=".json"
          className="hidden"
        />
      </div>

      {/* Area principale con canvas e pannello laterale */}
      <div className="flex flex-1 overflow-hidden">
        <div
          className="h-full w-full border border-slate-200 rounded-lg overflow-hidden bg-slate-50"
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes.map((node) => {
              return {
                ...node,
                data: {
                  ...node.data,
                  isCurrentPage: isPlayMode && node.id === currentPageId,
                },
              };
            })}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={memoizedEdgeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
            edgeUpdaterRadius={10}
            minZoom={0.1}
            maxZoom={4}
          >
            <Controls>
              <ControlButton onClick={navigateToStartPage}>
                <Flag size={20} />
              </ControlButton>
              <ControlButton
                onClick={navigateToCurrentPage}
                disabled={selectedNode == null}
              >
                <Target size={20} />
              </ControlButton>
            </Controls>
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
        {/* Sidebar delle milestone */}
        {isMilestonesSidebarVisible && (
          <MilestonesSidebar
            milestones={milestones}
            onClose={() => setIsMilestonesSidebarVisible(false)}
            onMilestonesChange={(updatedMilestones) => {
              setMilestones(updatedMilestones);
            }}
          />
        )}
        {/* Sidebar dei personaggi */}
        {isCharactersSidebarVisible && (
          <CharactersSidebar
            characters={characters}
            onCharactersChange={(updatedCharacters) => {
              setCharacters(updatedCharacters);
            }}
            onClose={() => setIsCharactersSidebarVisible(false)}
          />
        )}

        {/* Sidebar di editing del nodo */}
        {selectedNode &&
          (selectedNode.type === "page" ? (
            <PageSidebar
              selectedNode={selectedNode}
              nodeTitle={nodeTitle}
              nodeContent={nodeContent}
              nodeImage={nodeImage}
              nodeCharacter={nodeCharacter}
              characters={characters}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              onCharacterChange={handleCharacterChange}
              onNavigateToCurrentPage={navigateToCurrentPage}
              onDeselectNode={handleDeselectNode}
              imageInputRef={imageInputRef}
            />
          ) : (
            <ChoiceSidebar
              selectedNode={selectedNode}
              nodeTitle={nodeTitle}
              nodeContent={nodeContent}
              onTitleChange={handleTitleChange}
              onContentChange={handleContentChange}
              onNavigateToCurrentPage={navigateToCurrentPage}
              onDeselectNode={handleDeselectNode}
            />
          ))}

        {isPlayMode && (
          <div className="w-full md:w-1/3 flex flex-col border-l border-slate-200 bg-white">
            <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-slate-800">
                  Play Mode
                </h3>
                <div className="flex gap-2">
                  {pageHistory.length > 1 && (
                    <Button
                      onClick={goBack}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-slate-50 border-slate-200"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => setIsPlayMode(false)}
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {currentPageId && (
                <div className="space-y-4">
                  {/* Store current node in a variable */}
                  {(() => {
                    const currentNode = nodes.find(
                      (node) => node.id === currentPageId
                    );
                    return (
                      <>
                        <h4 className="text-xl font-semibold">
                          {currentNode?.data.title}
                        </h4>
                        {/* Character display */}
                        {currentNode?.data.character && (
                          <div className="flex flex-col items-center justify-center mb-4">
                            <div className="w-32 h-32 bg-white shadow-sm overflow-hidden">
                              <img
                                src={currentNode.data.character.image}
                                alt="Character"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="mt-2 text-sm font-medium text-slate-700 bg-white px-2 py-1 rounded-md shadow-sm">
                              {currentNode.data.character.name}
                            </span>
                          </div>
                        )}
                        {currentNode?.data.image && (
                          <div className="w-full overflow-hidden rounded-md">
                            <img
                              src={currentNode.data.image}
                              alt="Page illustration"
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        <div className="space-y-4">
                          <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: currentNode?.data.content || "",
                            }}
                          />

                          <div className="space-y-2">
                            {getAvailableChoices().map((choice) => {
                              if (!choice) return null;
                              const destinationPage = getDestinationPage(
                                choice.id
                              );
                              return (
                                <Button
                                  key={choice.id}
                                  onClick={() =>
                                    navigateToPage(destinationPage?.id || "")
                                  }
                                  className="w-full justify-start text-left bg-blue-200 hover:bg-blue-300 border border-slate-200 p-6"
                                >
                                  <div className="flex flex-col items-start gap-1">
                                    <span className="font-semibold text-slate-800">
                                      {choice.data.title}
                                    </span>
                                    {choice.data.content && (
                                      <span
                                        className="text-xs text-slate-600"
                                        dangerouslySetInnerHTML={{
                                          __html: choice.data.content,
                                        }}
                                      />
                                    )}
                                  </div>
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
