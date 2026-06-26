type ScoreBarProps = {
  label: string;
  value: number;
};

export default function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-900">{value}%</span>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div
          className="h-2 rounded-full bg-slate-900"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}