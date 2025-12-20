import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  PieChart as RechartPie,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "T1", actual: 650, forecast: 680, lastYear: 580 },
  { month: "T2", actual: 720, forecast: 710, lastYear: 620 },
  { month: "T3", actual: 780, forecast: 760, lastYear: 680 },
  { month: "T4", actual: 850, forecast: 820, lastYear: 720 },
  { month: "T5", actual: 890, forecast: 880, lastYear: 760 },
  { month: "T6", actual: null, forecast: 920, lastYear: 800 },
  { month: "T7", actual: null, forecast: 960, lastYear: 840 },
  { month: "T8", actual: null, forecast: 1000, lastYear: 880 },
];

const ltvData = [
  { service: "Niềng răng", ltv: 45, color: "#6A1B9A" },
  { service: "Implant", ltv: 38, color: "#8E24AA" },
  { service: "Bọc răng sứ", ltv: 28, color: "#AB47BC" },
  { service: "Tẩy trắng", ltv: 12, color: "#CE93D8" },
  { service: "Nhổ răng", ltv: 8, color: "#E1BEE7" },
];

const departmentData = [
  { name: "Marketing", budget: 120, spent: 98, roi: 324 },
  { name: "Vận hành", budget: 200, spent: 185, roi: 180 },
  { name: "Nhân sự", budget: 80, spent: 75, roi: 150 },
  { name: "IT", budget: 50, spent: 42, roi: 220 },
];

const ExecutiveDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <DashboardHeader onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển Điều hành</h1>
            <p className="text-muted-foreground">Tổng quan C-Level - Doanh thu, LTV và Dự báo AI</p>
          </div>

          {/* Efficient Cost Section */}
          <section className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chi phí hiệu quả</h2>
              <span className="text-sm text-muted-foreground">Quý 2/2024</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Tổng chi phí/Doanh thu"
                value="32.5%"
                change={-3.8}
                changeLabel="giảm so với quý trước"
                icon={<Wallet className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Chi phí nhân sự/DT"
                value="18.2%"
                change={-1.2}
                changeLabel="so với quý trước"
                icon={<Users className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí Marketing/DT"
                value="8.5%"
                change={-2.5}
                changeLabel="so với quý trước"
                icon={<Target className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí vận hành/DT"
                value="5.8%"
                change={0.5}
                changeLabel="so với quý trước"
                icon={<BarChart3 className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Executive KPIs */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Chỉ số Điều hành</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Doanh thu YTD"
                value="4.89 tỷ"
                change={18.5}
                changeLabel="so với cùng kỳ"
                icon={<DollarSign className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Lợi nhuận ròng"
                value="1.42 tỷ"
                change={22.3}
                changeLabel="so với cùng kỳ"
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="ROI Tổng thể"
                value="285%"
                change={15.8}
                changeLabel="so với quý trước"
                icon={<Target className="h-5 w-5" />}
              />
              <KPICard
                title="LTV Trung bình"
                value="18.5tr"
                change={12.4}
                changeLabel="so với năm trước"
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Revenue Forecast Chart */}
          <section className="mb-8 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground">Doanh thu & Dự báo AI</h3>
                  <p className="text-sm text-muted-foreground">So sánh MOM/YOY với dự báo</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-purple" />
                    <span>Thực tế</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-chart-purple-light" />
                    <span>Dự báo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-muted" />
                    <span>Năm trước</span>
                  </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6A1B9A" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6A1B9A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `${v}tr`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}tr`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#6A1B9A"
                    strokeWidth={2}
                    fill="url(#actualGradient)"
                    name="Thực tế"
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#AB47BC"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Dự báo"
                  />
                  <Line
                    type="monotone"
                    dataKey="lastYear"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    name="Năm trước"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* LTV by Service */}
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <h3 className="font-semibold text-foreground mb-4">LTV theo Dịch vụ</h3>
              <div className="space-y-4">
                {ltvData.map((item, index) => (
                  <div key={item.service} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.service}</span>
                      <span className="font-medium text-foreground">{item.ltv}tr</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.ltv / 45) * 100}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Department Performance */}
          <section className="mb-8">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <h3 className="font-semibold text-foreground mb-4">Hiệu suất theo Bộ phận</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Bộ phận</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Ngân sách</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">Đã chi</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">% Sử dụng</th>
                      <th className="py-3 px-4 text-right text-sm font-medium text-muted-foreground">ROI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentData.map((dept) => (
                      <tr key={dept.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-medium text-foreground">{dept.name}</td>
                        <td className="py-3 px-4 text-right text-foreground">{dept.budget}tr</td>
                        <td className="py-3 px-4 text-right text-foreground">{dept.spent}tr</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(dept.spent / dept.budget) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-foreground">{Math.round((dept.spent / dept.budget) * 100)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                            <ArrowUpRight className="h-3 w-3" />
                            {dept.roi}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
