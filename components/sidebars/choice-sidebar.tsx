import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Target, X } from "lucide-react";
import { Node } from "reactflow";
import { Milestone } from "@/models/milestone";

interface ChoiceSidebarProps {
  selectedNode: Node;
  nodeTitle: string;
  nodeContent: string;
  milestones: Milestone[];
  onTriggerMilestoneChange: (milestoneId: string) => void;
  onRequiredMilestoneChange: (milestoneId: string) => void;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onContentChange: (content: string) => void;
  onNavigateToCurrentPage: () => void;
  onDeselectNode: () => void;
}

export function ChoiceSidebar({
  selectedNode,
  nodeTitle,
  nodeContent,
  milestones,
  onTriggerMilestoneChange,
  onRequiredMilestoneChange,
  onTitleChange,
  onContentChange,
  onNavigateToCurrentPage,
  onDeselectNode,
}: ChoiceSidebarProps) {
  return (
    <div className="w-full md:w-1/3 flex flex-col border-l border-slate-200 bg-white">
      <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium text-slate-800">Edit Choice</h3>
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
          {/* Trigger Milestone section */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Trigger Milestone
            </label>
            <select
              value={selectedNode.data.triggerMilestone?.id || ""}
              onChange={(e) => onTriggerMilestoneChange(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            >
              <option value="">No Milestone</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.text}
                </option>
              ))}
            </select>
          </div>
          {/* Required Milestone section */}
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">
              Required Milestone
            </label>
            <select
              value={selectedNode.data.requiredMilestone?.id || ""}
              onChange={(e) => onRequiredMilestoneChange(e.target.value)}
              className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none"
            >
              <option value="">No Milestone</option>
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.text}
                </option>
              ))}
            </select>
          </div>

          {/* Debug section */}
          <div>
            <p className="text-sm text-slate-500">Node ID: {selectedNode.id}</p>
            <p className="text-sm text-slate-500">Type: Choice</p>
            <p className="text-sm text-slate-500">
              Dimensions: {selectedNode.data.width}px ×{" "}
              {selectedNode.data.height}px
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
