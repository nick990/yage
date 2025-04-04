"use client";

import type React from "react";

import { memo, useRef } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { ArrowRightFromLine, Trash2 } from "lucide-react";

// Update the ChoiceNode to display an image if available
export const ChoiceNode = memo(
  ({ data, isConnectable, id, selected }: NodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const nodeRef = useRef<HTMLDivElement>(null);
    const width = data.width || 250;
    const height = data.height || 150;

    // Function to handle node deletion
    const handleDelete = (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent node selection when clicking delete

      // Ask for confirmation
      if (window.confirm("Are you sure you want to delete this choice?")) {
        // Delete the node directly
        setNodes((nodes) => nodes.filter((node) => node.id !== id));

        // Delete connected edges
        setEdges((edges) =>
          edges.filter((edge) => edge.source !== id && edge.target !== id)
        );
      }
    };

    return (
      <div
        ref={nodeRef}
        className={`shadow-lg rounded-md border ${
          selected
            ? "border-violet-400 ring-2 ring-violet-200"
            : "border-slate-200"
        } bg-slate-50`}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
          padding: "12px",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="rounded-full w-8 h-8 flex items-center justify-center bg-violet-100">
              <ArrowRightFromLine className="h-4 w-4 text-violet-600" />
            </div>
            <div className="ml-2">
              <div className="text-sm font-bold text-slate-800">
                {data.title}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleDelete}
              className="text-slate-400 hover:text-rose-500 transition-colors"
              title="Delete node"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100%-40px)] overflow-hidden">
          {/* Content area with fixed height and scrolling */}
          <div
            className="mt-3 text-xs text-slate-600 overflow-y-auto prose prose-sm max-w-none node-content"
            style={{
              height: "90px",
              paddingRight: "10px", // Add padding to prevent text from being too close to scrollbar
            }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />

          {/* Display image if available */}
          {data.image && (
            <div className="mt-2">
              <img
                src={data.image || "/placeholder.svg"}
                alt={`Image for ${data.title}`}
                className="w-full h-auto object-contain rounded border border-slate-200"
                style={{ maxHeight: "50px" }}
              />
            </div>
          )}
        </div>

        {/* Input handle */}
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          className="node-handle"
        />

        {/* Output handle */}
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={isConnectable}
          className="node-handle"
        />
      </div>
    );
  }
);

ChoiceNode.displayName = "ChoiceNode";
