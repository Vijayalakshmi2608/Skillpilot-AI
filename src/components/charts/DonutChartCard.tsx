import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const palette = ["#2563EB", "#10B981", "#F59E0B", "#6366F1", "#F43F5E", "#0EA5E9", "#8B5CF6", "#14B8A6"];

interface DonutChartCardProps {
  data: { name: string; value: number }[];
  centerLabel?: string;
  centerValue?: string;
}

function DonutChartCard({ data, centerLabel, centerValue }: DonutChartCardProps) {
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--popover))" }}
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <span className="font-display text-2xl font-bold">{centerValue}</span>}
          {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export { DonutChartCard };
