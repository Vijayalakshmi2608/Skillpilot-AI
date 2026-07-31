export function buildComparisonData(a: { salary: string; demandScore: number; growth: number; fees: string }, b: { salary: string; demandScore: number; growth: number; fees: string }) {
  const num = (s: string) => parseFloat(s.replace(/[^\d.]/g, "")) || 0;
  return [
    { metric: "Salary (LPA)", A: num(a.salary), B: num(b.salary) },
    { metric: "Demand Score", A: a.demandScore, B: b.demandScore },
    { metric: "Growth %", A: a.growth, B: b.growth },
    { metric: "Fees (L)", A: num(a.fees), B: num(b.fees) },
  ];
}
