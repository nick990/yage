import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X, Pencil } from "lucide-react";
import { createMilestone, Milestone } from "@/models/milestone";

interface MilestonesSidebarProps {
  milestones: Milestone[];
  onMilestonesChange: (milestones: Milestone[]) => void;
  onClose: () => void;
}

export function MilestonesSidebar({
  milestones,
  onMilestonesChange,
  onClose,
}: MilestonesSidebarProps) {
  const [newMilestoneText, setNewMilestoneText] = useState("");

  const handleAddMilestone = () => {
    console.log("newMilestoneText", newMilestoneText);
    if (newMilestoneText.trim()) {
      const newMilestone = createMilestone(newMilestoneText.trim());
      console.log("newMilestone", newMilestone);
      onMilestonesChange([...milestones, newMilestone]);
      setNewMilestoneText("");
    }
  };
  return (
    <div className="w-64 h-full border-l border-slate-200 flex flex-col flex-shrink-0">
      <div className="flex-none p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800">Milestones</h3>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-red-50 hover:text-red-600 border-slate-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex gap-2 mb-4">
          <Input
            value={newMilestoneText}
            onChange={(e) => setNewMilestoneText(e.target.value)}
            placeholder="New milestone"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddMilestone();
              }
            }}
          />
          <Button size="icon" onClick={handleAddMilestone}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="flex items-center gap-2 p-2 border rounded-lg"
            >
              {milestone.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
