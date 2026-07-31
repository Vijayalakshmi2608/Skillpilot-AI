import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartCardProps {
  data: Record<string, string | number>[];
  xKey: string;
  bars: { key: string; name?: string; color?: string }[];
}

const palette = ["#2563EB", "#6366F1", "#10B981", "#F59E0B", "#F43F5E", "#0EA5E9"];

function BarChartCard({ data, xKey, bars }: BarChartCardProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.5 }}
          contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }}
        />
        {bars.map((b, i) => (
          <Bar key={b.key} dataKey={b.key} name={b.name ?? b.key} fill={b.color ?? palette[i % palette.length]} radius={[6, 6, 0, 0]} maxBarSize={36} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export { BarChartCard };
