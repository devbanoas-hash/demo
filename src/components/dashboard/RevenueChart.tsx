import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "T1", revenue: 420, profit: 180 },
  { month: "T2", revenue: 380, profit: 150 },
  { month: "T3", revenue: 520, profit: 220 },
  { month: "T4", revenue: 480, profit: 200 },
  { month: "T5", revenue: 620, profit: 280 },
  { month: "T6", revenue: 580, profit: 250 },
  { month: "T7", revenue: 720, profit: 340 },
  { month: "T8", revenue: 680, profit: 310 },
  { month: "T9", revenue: 780, profit: 380 },
  { month: "T10", revenue: 820, profit: 400 },
  { month: "T11", revenue: 750, profit: 360 },
  { month: "T12", revenue: 890, profit: 450 },
];

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  return (
    <div className={className}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Xu hướng Doanh thu & Lợi nhuận
          </h3>
          <p className="text-sm text-muted-foreground">Theo tháng năm 2024</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Doanh thu</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-3" />
            <span className="text-muted-foreground">Lợi nhuận</span>
          </div>
        </div>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}tr`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-md)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              formatter={(value: number, name: string) => [
                `${value} triệu VNĐ`,
                name === "revenue" ? "Doanh thu" : "Lợi nhuận",
              ]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="hsl(var(--chart-3))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "hsl(var(--chart-3))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
