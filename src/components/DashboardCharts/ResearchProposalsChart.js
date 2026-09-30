import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "For Approval", value: 35, color: "#c84c4c" },
  { name: "On-going", value: 10, color: "#d9a514" },
  { name: "Completed", value: 15, color: "#2f855a" },
];

export default function ResearchProposalsChart() {
  return (
    <article className="dashboard-chart-card">
      <header className="dashboard-chart-header">
        <div>
          <span>CCIT</span>
          <h3>Research proposals</h3>
        </div>
        <div className="dashboard-chart-total">
          <strong>60</strong>
          <span>Total</span>
        </div>
      </header>

      <div className="dashboard-chart-body" role="img" aria-label="Research proposals by status chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7edf2" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#60758a", fontSize: 12 }} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#718096", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "#f4f7fa" }}
              formatter={(value) => [`${value} proposals`, "Count"]}
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
