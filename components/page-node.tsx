"use client";

import type React from "react";

import { memo, useRef, useEffect } from "react";
import { Handle, Position, type NodeProps, useReactFlow } from "reactflow";
import { BookOpen, Trash2, Flag } from "lucide-react";

// Update the PageNode to display an image if available and adjust height accordingly
export const PageNode = memo(
  ({ data, isConnectable, id, selected }: NodeProps) => {
    const { setNodes, setEdges } = useReactFlow();
    const nodeRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const width = data.width || 360; // Default width

    // Base height without image
    const contentHeight = 140; // Fixed content height remains the same
    const headerHeight = 40; // Approx header height
    const padding = 24; // Total padding (12px top + 12px bottom)

    // Calcolo base dell'altezza senza immagine
    let baseHeight = headerHeight + contentHeight + padding;

    // Impostiamo una altezza minima, ma lasciamo che React-Flow gestisca
    // l'altezza totale in base al contenuto se c'è un'immagine
    const height = data.image ? "auto" : `${baseHeight}px`;

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

    // Gestione migliorata dell'evento wheel
    useEffect(() => {
      const contentElement = contentRef.current;
      if (!contentElement) return;

      // Funzione di gestione dell'evento wheel
      const handleWheel = (e: WheelEvent) => {
        // Skip se si stanno usando tasti modificatori (ctrl/cmd per zoom)
        if (e.ctrlKey || e.metaKey) return;

        // Verifichiamo se l'area è scrollabile
        const isScrollable =
          contentElement.scrollHeight > contentElement.clientHeight;
        if (!isScrollable) return; // Non fare nulla se non c'è scroll

        // Calcola il margine di tolleranza (1px per gestire problemi di arrotondamento)
        const tolerance = 1;

        // Definisci i limiti con tolleranza
        const isAtTop = contentElement.scrollTop <= tolerance;
        const isAtBottom =
          contentElement.scrollTop + contentElement.clientHeight >=
          contentElement.scrollHeight - tolerance;

        // Se scrolliamo verso il basso (deltaY > 0) e non siamo alla fine,
        // oppure se scrolliamo verso l'alto (deltaY < 0) e non siamo all'inizio
        if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
          e.stopPropagation();
          e.preventDefault(); // Previene qualsiasi scroll/zoom della pagina

          // Applica lo scroll manualmente in modo fluido
          contentElement.scrollTop += e.deltaY;
        }
        // Nelle zone di confine (top/bottom) con scroll nella direzione opposta,
        // preveniamo comunque lo zoom
        else if ((e.deltaY > 0 && isAtBottom) || (e.deltaY < 0 && isAtTop)) {
          // Siamo al limite ma l'utente sta ancora cercando di scrollare
          // nella stessa direzione - preveniamo lo zoom ma permettiamo
          // che l'evento si propaghi al ReactFlow
          e.stopPropagation();
          e.preventDefault();
        }
      };

      // Aggiungi l'event listener
      contentElement.addEventListener("wheel", handleWheel, { passive: false });

      // Rimuovi l'event listener quando il componente si smonta
      return () => {
        contentElement.removeEventListener("wheel", handleWheel);
      };
    }, []);

    // Definizione degli stili personalizzati per gli handle
    const handleStyle = {
      width: "16px", // Aumentata da 8px (default)
      height: "16px", // Aumentata da 8px (default)
      background: "#6366F1", // Colore indigo per abbinare il tema
      border: "2px solid white",
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
          height: height, // Use "auto" for nodes with images
          position: "relative",
          padding: "12px",
          overflow: "hidden",
          minHeight: `${baseHeight}px`, // Garantisce un'altezza minima
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
            ref={contentRef}
            className="mt-3 text-xs text-slate-600 overflow-y-scroll prose prose-sm max-w-none node-content"
            style={{
              height: "140px", // Fixed height for content area always
              paddingRight: "10px",
              overflowY: "scroll", // Always show scrollbar
              touchAction: "pan-y", // Permettiamo solo pan-y sui dispositivi touch
            }}
            dangerouslySetInnerHTML={{ __html: data.content }}
          />

          {/* Display image if available in its own container - full width */}
          {data.image && (
            <div className="mt-3 mb-1 w-full">
              <img
                src={data.image || "/placeholder.svg"}
                alt={`Image for ${data.title}`}
                className="w-full h-auto object-cover rounded border border-slate-200"
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
            className="node-handle"
          />
        )}

        {/* Only show output handle if not end node */}
        {!data.isEndNode && (
          <Handle
            type="source"
            position={Position.Right}
            isConnectable={isConnectable}
            className="node-handle"
          />
        )}
      </div>
    );
  }
);

PageNode.displayName = "PageNode";
