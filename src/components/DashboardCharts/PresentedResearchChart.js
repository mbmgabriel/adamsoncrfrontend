import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Aug 2023", value: 3, color: "#FDD835" },
  { name: "Oct 2023", value: 6, color: "#43A047" },
  { name: "Nov 2023", value: 2, color: "#FDD835" },
];

export default function PresentedResearchChart() {
  return (
    <div className="card shadow-sm w-100">
      <div className="card-body">

        <h5 className="text-center mb-4">
          CCIT Presented Researches
        </h5>

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
