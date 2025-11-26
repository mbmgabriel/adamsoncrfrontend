import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "New", value: 6, color: "#E53935" },
  { name: "Revised", value: 5, color: "#FDD835" },
  { name: "Endorsed", value: 24, color: "#43A047" },
];

export default function ReviewStatusChart() {
  return (
    <div className="bg-white p-4 rounded shadow w-100">
      <h3 className="fw-semibold text-center mb-4">
        CCIT Research Application Review Status
      </h3>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="small fst-italic text-end mt-3">
        Data is as of January 28, 2024, 10:00AM
      </p>
    </div>
  );
}
