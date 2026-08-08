import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartCardProps {
  data: { subject: string; value: number }[];
  stroke?: string;
  fill?: string;
}

function RadarChartCard({ data, stroke = "#2563EB", fill = "rgba(37, 99, 235, 0.35)" }: RadarChartCardProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }}
        />
        <Radar dataKey="value" stroke={stroke} fill={fill} fillOpacity={0.75} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export { RadarChartCard };
