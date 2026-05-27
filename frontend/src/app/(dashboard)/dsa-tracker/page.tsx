import DSATable from "@/components/DSATable";
import { Code2 } from "lucide-react";

export const metadata = {
  title: "DSA Tracker — PlacePrep AI",
  description: "Track your Data Structures & Algorithms progress across all major topics.",
};

export default function DSATrackerPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Code2 className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">DSA Tracker</h1>
          <p className="text-sm text-muted">
            Track your progress across all Data Structures & Algorithms topics
          </p>
        </div>
      </div>

      {/* DSA Table Component */}
      <DSATable />
    </div>
  );
}
