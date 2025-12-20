import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { service: "Niềng răng", revenue: 450, patients: 120 },
  { service: "Implant", revenue: 380, patients: 85 },
  { service: "Tẩy trắng", revenue: 220, patients: 200 },
  { service: "Nhổ răng", revenue: 150, patients: 180 },
  { service: "Trám răng", revenue: 120, patients: 250 },
  { service: "Cạo vôi", revenue: 80, patients: 300 },
];

interface PatientChartProps {
  className?: string;
}

export function PatientChart({ className }: PatientChartProps) {
  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Doanh thu theo Dịch vụ
        </h3>
        <p className="text-sm text-muted-foreground">Phân tích Pareto - Q4 2024</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}tr`}
            />
            <YAxis
              type="category"
              dataKey="service"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
              formatter={(value: number, name: string) => [
                name === "revenue" ? `${value} triệu VNĐ` : `${value} bệnh nhân`,
                name === "revenue" ? "Doanh thu" : "Số bệnh nhân",
              ]}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(280, ${80 - index * 8}%, ${45 + index * 5}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
