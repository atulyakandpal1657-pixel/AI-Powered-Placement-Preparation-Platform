export default function QuestionSkeleton() {
  return (
    <div className="glass-card p-4 space-y-3 animate-pulse">
      <div className="h-4 bg-surface rounded w-2/3" />
      <div className="h-3 bg-surface rounded w-1/3" />
      <div className="h-3 bg-surface rounded w-1/2" />
    </div>
  );
}
