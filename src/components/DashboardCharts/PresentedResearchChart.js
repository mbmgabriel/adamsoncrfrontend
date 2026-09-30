import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Aug 2023", value: 3, color: "#8fb3ce" },
  { name: "Oct 2023", value: 6, color: "#2f855a" },
  { name: "Nov 2023", value: 2, color: "#8fb3ce" },
];

export default function PresentedResearchChart() {
  return (
    <article className="dashboard-chart-card">
      <header className="dashboard-chart-header">
        <div>
          <span>CCIT</span>
          <h3>Presented research</h3>
        </div>
        <div className="dashboard-chart-total">
          <strong>11</strong>
          <span>Total</span>
        </div>
      </header>

      <div className="dashboard-chart-body" role="img" aria-label="Presented research by month chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7edf2" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#60758a", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "#f4f7fa" }}
              formatter={(value) => [`${value} presentations`, "Count"]}
              contentStyle={{ border: "1px solid #dce4eb", borderRadius: 6, boxShadow: "0 8px 20px rgba(24, 43, 63, 0.12)" }}
            />
            <Bar dataKey="value" barSize={44} radius={[5, 5, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
