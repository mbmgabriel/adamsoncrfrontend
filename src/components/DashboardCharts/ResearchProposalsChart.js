import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "For Approval", value: 35, color: "#E53935" },
  { name: "On-going", value: 10, color: "#FDD835" },
  { name: "Completed", value: 15, color: "#43A047" },
];

export default function ResearchProposalsChart() {
  return (
    <div className="card w-100 shadow-sm">
      <div className="card-body">

        <h5 className="text-center mb-4">CCIT Research Proposals</h5>

        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="small fst-italic text-end mt-3">
          Data is as of January 28, 2024, 10:00AM
        </p>

      </div>
    </div>
  );
}
