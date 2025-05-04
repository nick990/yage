import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Target, X, Trash, Image } from "lucide-react";
import { Node } from "reactflow";
import { Character } from "@/models/character";

interface PageSidebarProps {
  selectedNode: Node;
  nodeTitle: string;
  nodeContent: string;
  nodeImage: string | null;
  nodeCharacter: Character | null;
  characters: Character[];
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (content: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageDelete: () => void;
  onCharacterChange: (characterId: string) => void;
  onNavigateToCurrentPage: () => void;
  onDeselectNode: () => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
}

export function PageSidebar({
  selectedNode,
  nodeTitle,
  nodeContent,
  nodeImage,
  nodeCharacter,
  characters,
  onTitleChange,
  onContentChange,
  onImageUpload,
  onImageDelete,
  onCharacterChange,
  onNavigateToCurrentPage,
  onDeselectNode,
  imageInputRef,
}: PageSidebarProps) {
  const triggerImageUpload = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  return (
    <div className="w-full md:w-1/3 flex flex-col border-l border-slate-200 bg-white">
      <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-slate-800">Edit Page</h3>
            <Button
              onClick={onNavigateToCurrentPage}
              variant="outline"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <Target className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={onDeselectNode}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={nodeTitle}
              onChange={onTitleChange}
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Content
            </label>
            <RichTextEditor content={nodeContent} onChange={onContentChange} />
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
                    onClick={onImageDelete}
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
                    className="bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
                  >
                    Upload Image
                  </Button>
                </div>
              )}
              <input
                type="file"
                ref={imageInputRef}
                onChange={onImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* Character selection */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Character
            </label>
            <select
              value={nodeCharacter?.id || ""}
              onChange={(e) => onCharacterChange(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            >
              <option value="">No Character</option>
              {characters.map((character) => (
                <option key={character.id} value={character.id}>
                  {character.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm text-slate-500">Node ID: {selectedNode.id}</p>
            <p className="text-sm text-slate-500">Type: Page</p>
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
    </div>
  );
}
