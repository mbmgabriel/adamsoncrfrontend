import { Cell, Label, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "New", value: 6, color: "#c84c4c" },
  { name: "Revised", value: 5, color: "#d9a514" },
  { name: "Endorsed", value: 24, color: "#2f855a" },
];

export default function ReviewStatusChart() {
  return (
    <article className="dashboard-chart-card">
      <header className="dashboard-chart-header">
        <div>
          <span>CCIT</span>
          <h3>Application review status</h3>
        </div>
        <div className="dashboard-chart-total">
          <strong>35</strong>
          <span>Total</span>
        </div>
      </header>

      <div className="dashboard-chart-body" role="img" aria-label="Application review status chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={2}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={3}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
              <Label
                value="35 total"
                position="center"
                fill="#243b53"
                fontSize={16}
                fontWeight={700}
              />
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} applications`, name]}
              contentStyle={{ border: "1px solid #dce4eb", borderRadius: 6, boxShadow: "0 8px 20px rgba(24, 43, 63, 0.12)" }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              verticalAlign="bottom"
              formatter={(value) => <span className="dashboard-chart-legend-label">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}
