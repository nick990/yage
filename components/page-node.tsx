"use client";

import type React from "react";

import { memo, useRef } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BookOpen, Trash2, Flag } from "lucide-react";

// Update the PageNode to display an image if available and adjust height accordingly
export const PageNode = memo(
  ({ data, isConnectable, id, selected }: NodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const nodeRef = useRef<HTMLDivElement>(null);
    const width = data.width || 360; // Default width

    // Calculate dynamic height based on whether an image is present
    const contentHeight = 140; // Fixed content height remains the same
    const imageHeight = data.image ? 100 : 0; // Allow 100px for image + margin if present
    const headerHeight = 40; // Approx header height
    const totalHeight = headerHeight + contentHeight + imageHeight;

    // Function to handle node deletion
    const handleDelete = (event: React.MouseEvent) => {
      event.stopPropagation(); // Prevent node selection when clicking delete

      // Don't delete if this is the start node
      if (data.isStartNode) {
        alert("The start page cannot be deleted.");
        return;
      }

      // Delete the node directly
      setNodes((nodes) => nodes.filter((node) => node.id !== id));

      // Delete connected edges
      setEdges((edges) =>
        edges.filter((edge) => edge.source !== id && edge.target !== id)
      );
    };

    return (
      <div
        ref={nodeRef}
        className={`shadow-lg rounded-md border ${
          selected
            ? "border-indigo-400 ring-2 ring-indigo-200"
            : "border-slate-200"
        } bg-white`}
        style={{
          width: `${width}px`,
          height: `${totalHeight}px`, // Use dynamic calculated height
          position: "relative",
          padding: "12px",
          overflow: "hidden",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`rounded-full w-8 h-8 flex items-center justify-center ${
                data.isStartNode
                  ? "bg-emerald-100 text-emerald-600"
                  : data.isEndNode
                  ? "bg-rose-100 text-rose-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {data.isStartNode ? (
                <BookOpen className="h-4 w-4" />
              ) : data.isEndNode ? (
                <Flag className="h-4 w-4" />
              ) : (
                <BookOpen className="h-4 w-4" />
              )}
            </div>
            <div className="ml-2">
              <div className="text-sm font-bold text-slate-800">
                {data.title}
              </div>
              {data.isStartNode && (
                <div className="text-xs text-emerald-600">Start Page</div>
              )}
              {data.isEndNode && (
                <div className="text-xs text-rose-600">End Page</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!data.isStartNode && (
              <button
                onClick={handleDelete}
                className="text-slate-400 hover:text-rose-500 transition-colors"
                title="Delete node"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          {/* Content area with FIXED height regardless of image */}
          <div
            className="mt-3 text-xs text-slate-600 overflow-y-scroll prose prose-sm max-w-none node-content"
            style={{
              height: "140px", // Fixed height for content area always
              paddingRight: "10px",
              overflowY: "scroll", // Always show scrollbar
            }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />

          {/* Display image if available in its own container */}
          {data.image && (
            <div className="mt-3 mb-1">
              <img
                src={data.image || "/placeholder.svg"}
                alt={`Image for ${data.title}`}
                className="w-full h-auto object-contain rounded border border-slate-200"
                style={{ maxHeight: "80px" }}
              />
            </div>
          )}
        </div>

        {/* Only show input handle if not start node */}
        {!data.isStartNode && (
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={isConnectable}
            className="w-6 h-6 bg-indigo-500 border-2 border-white"
          />
        )}

        {/* Only show output handle if not end node */}
        {!data.isEndNode && (
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            className="w-6 h-6 bg-indigo-500 border-2 border-white"
          />
        )}
      </div>
    );
  }
);

PageNode.displayName = "PageNode";
