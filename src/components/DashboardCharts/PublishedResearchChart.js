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
  { name: "Jul 2023", value: 1, color: "#FDD835" },
  { name: "Aug 2023", value: 3, color: "#FDD835" },
  { name: "Oct 2023", value: 5, color: "#43A047" },
  { name: "Dec 2023", value: 8, color: "#43A047" },
];

export default function PublishedResearchChart() {
  return (
    <div className="card w-100 shadow-sm">
      <div className="card-body">

        <h5 className="text-center mb-4">
          CCIT Published Researches
        </h5>

        <div style={{ width: "100%", height: "260px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
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
