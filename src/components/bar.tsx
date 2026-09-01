export function Bar({
  value,
  color = "bg-gold",
  track = "bg-white/10",
}: {
  value: number;
  color?: string;
  track?: string;
}) {
  return (
    <div className={`mt-4 h-1 rounded-full ${track}`}>
      <div
        className={`h-full rounded-full ${color} animate-barfill`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
