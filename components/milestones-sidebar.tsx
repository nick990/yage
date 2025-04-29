import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image, Plus, Trash2, X, Pencil } from "lucide-react";
import { Milestone } from "@/models/milestone";

interface MilestonesSidebarProps {
  milestones: Milestone[];
  onClose: () => void;
}

export function MilestonesSidebar({
  milestones: milesotones,
  onClose,
}: MilestonesSidebarProps) {
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
    </div>
  );
}
