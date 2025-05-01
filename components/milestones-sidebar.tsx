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
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [editMilestoneText, setEditMilestoneText] = useState("");

  const handleAddMilestone = () => {
    if (newMilestoneText.trim()) {
      const newMilestone = createMilestone(newMilestoneText.trim());
      onMilestonesChange([...milestones, newMilestone]);
      setNewMilestoneText("");
    }
  };
  const handleDeleteMilestone = (id: string) => {
    const milestone = milestones.find((milestone) => milestone.id === id);
    if (!milestone) return;

    if (
      window.confirm(
        `Are you sure you want to delete the milestone "${milestone.text}"?`
      )
    ) {
      if (editingMilestone?.id === id) {
        setEditingMilestone(null);
      }
      onMilestonesChange(milestones.filter((milestone) => milestone.id !== id));
    }
  };

  const startEditing = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setEditMilestoneText(milestone.text);
  };

  const cancelEditing = () => {
    setEditingMilestone(null);
    setEditMilestoneText("");
  };

  const saveEditing = () => {
    if (!editingMilestone) return;
    const updatedMilestone = { ...editingMilestone, text: editMilestoneText };
    onMilestonesChange(
      milestones.map((milestone) =>
        milestone.id === editingMilestone.id ? updatedMilestone : milestone
      )
    );

    setEditingMilestone(null);
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
            <div key={milestone.id}>
              {editingMilestone?.id === milestone.id ? (
                <div className="border-red-200 bg-red-50 p-2 border rounded-lg">
                  <Input
                    value={editMilestoneText}
                    onChange={(e) => setEditMilestoneText(e.target.value)}
                    placeholder="Name"
                    className="flex-1 text-sm"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      onClick={cancelEditing}
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:text-slate-800"
                    >
                      Annulla
                    </Button>
                    <Button
                      onClick={saveEditing}
                      variant="default"
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Salva
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-xs">
                  <div className="flex-1 border p-2">{milestone.text}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => startEditing(milestone)}
                    className="h-6 w-6"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteMilestone(milestone.id)}
                    className="h-6 w-6"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
