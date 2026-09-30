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
  { name: "Jul 2023", value: 1, color: "#8fb3ce" },
  { name: "Aug 2023", value: 3, color: "#8fb3ce" },
  { name: "Oct 2023", value: 5, color: "#5d9d7a" },
  { name: "Dec 2023", value: 8, color: "#2f855a" },
];

export default function PublishedResearchChart() {
  return (
    <article className="dashboard-chart-card">
      <header className="dashboard-chart-header">
        <div>
          <span>CCIT</span>
          <h3>Published research</h3>
        </div>
        <div className="dashboard-chart-total">
          <strong>17</strong>
          <span>Total</span>
        </div>
      </header>

      <div className="dashboard-chart-body" role="img" aria-label="Published research by month chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7edf2" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#60758a", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "#f4f7fa" }}
              formatter={(value) => [`${value} publications`, "Count"]}
              contentStyle={{ border: "1px solid #dce4eb", borderRadius: 6, boxShadow: "0 8px 20px rgba(24, 43, 63, 0.12)" }}
            />
            <Bar dataKey="value" barSize={40} radius={[5, 5, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
