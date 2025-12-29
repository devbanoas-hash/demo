import { useState } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Percent,
  Wallet,
  Target,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { PatientChart } from "@/components/dashboard/PatientChart";
import { ChannelROIChart } from "@/components/dashboard/ChannelROIChart";
import { ConversionFunnel } from "@/components/dashboard/ConversionFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

// AI Analytics Data (merged from AIAnalytics page)
const competitorData = [
  { period: "T10/2024", competitor: "Clinic A", pressureIndex: 72, funnelImpact: 15, priceScore: 68, offerScore: 75, trustGap: 20, level: "High" },
  { period: "T11/2024", competitor: "Clinic B", pressureIndex: 58, funnelImpact: 10, priceScore: 62, offerScore: 55, trustGap: 15, level: "Medium" },
  { period: "T12/2024", competitor: "Clinic C", pressureIndex: 45, funnelImpact: 8, priceScore: 50, offerScore: 48, trustGap: 10, level: "Low" },
];

const funnelLeakageRaw = [
  { stage: "Lead → Booking", loss: 32 },
  { stage: "Booking → Show-up", loss: 24 },
  { stage: "Show-up → Consult", loss: 25 },
  { stage: "Consult → Close", loss: 28 },
];
const funnelLeakage = [...funnelLeakageRaw].sort((a, b) => b.loss - a.loss);

const performanceTrend = [
  { month: "T7", conversion: 28, revenue: 850 },
  { month: "T8", conversion: 32, revenue: 920 },
  { month: "T9", conversion: 30, revenue: 880 },
  { month: "T10", conversion: 35, revenue: 1050 },
  { month: "T11", conversion: 33, revenue: 980 },
  { month: "T12", conversion: 38, revenue: 1120 },
];

const rootCauseData = [
  { factor: "Giá cạnh tranh", score: 75 },
  { factor: "Ưu đãi đối thủ", score: 68 },
  { factor: "Thương hiệu", score: 82 },
  { factor: "Chất lượng DV", score: 90 },
  { factor: "Vị trí", score: 70 },
  { factor: "Marketing", score: 65 },
];

const CEODashboard = () => {
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
            <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển CEO</h1>
            <p className="text-muted-foreground">Phân tích xu hướng, KPI, hiệu suất và cạnh tranh</p>
          </div>

          {/* Executive Health Snapshot */}
          <section className="mb-8 animate-fade-in">
            <h2 className="text-lg font-semibold text-foreground mb-4">Sức Khỏe Kinh Doanh</h2>
            <div className="grid gap-4 md:grid-cols-5">
              <Card className="border-primary/20">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Sức Khỏe KD</p>
                      <p className="text-2xl font-bold text-primary">78%</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Activity className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +5% so với tháng trước
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Doanh Thu</p>
                      <p className="text-2xl font-bold">1.12B</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +12% MOM
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Conversion</p>
                      <p className="text-2xl font-bold">28%</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                      <Target className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> -2% so với mục tiêu
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Áp Lực CT</p>
                      <p className="text-2xl font-bold">65</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +8 điểm
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">KH Mới</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +18% MOM
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* KPI Cards with Efficient Cost */}
          <section className="mb-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Chi phí hiệu quả</h2>
              <span className="text-sm text-muted-foreground">Cập nhật: Hôm nay</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
              <KPICard
                title="Chi phí/Khách hàng (CAC)"
                value="1.2tr"
                change={-8.5}
                changeLabel="giảm so với tháng trước"
                icon={<Wallet className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Chi phí/Lead (CPL)"
                value="450k"
                change={-12.3}
                changeLabel="giảm so với tháng trước"
                icon={<Target className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí Marketing/DT"
                value="8.5%"
                change={-2.1}
                changeLabel="so với tháng trước"
                icon={<DollarSign className="h-5 w-5" />}
              />
              <KPICard
                title="Chi phí vận hành/Ca"
                value="890k"
                change={3.2}
                changeLabel="so với tháng trước"
                icon={<Activity className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Revenue & Performance KPIs */}
          <section className="mb-8 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Doanh thu & Hiệu suất</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KPICard
                title="Doanh thu tháng"
                value="890tr"
                change={12.5}
                icon={<DollarSign className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Lợi nhuận ròng"
                value="234tr"
                change={15.2}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="Bệnh nhân mới"
                value="234"
                change={8.2}
                icon={<Users className="h-5 w-5" />}
              />
              <KPICard
                title="Tỷ lệ Show-up"
                value="87%"
                change={3.4}
                icon={<Percent className="h-5 w-5" />}
              />
              <KPICard
                title="ROI Marketing"
                value="324%"
                change={15.8}
                icon={<TrendingUp className="h-5 w-5" />}
              />
              <KPICard
                title="LTV Trung bình"
                value="15.2tr"
                change={7.5}
                icon={<Users className="h-5 w-5" />}
              />
            </div>
          </section>

          {/* Charts Row 1 */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <RevenueChart />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.15s" }}>
              <PatientChart />
            </div>
          </section>

          {/* Charts Row 2 */}
          <section className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <ChannelROIChart />
            </div>
            <div className="rounded-lg border bg-card p-6 shadow-card animate-fade-in" style={{ animationDelay: "0.25s" }}>
              <ConversionFunnel />
            </div>
          </section>

          {/* Competitive Analysis (merged from AI Analytics) */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Phân Tích Cạnh Tranh</h2>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Funnel Leakage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Điểm Thủng Funnel (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={funnelLeakage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 50]} fontSize={11} />
                      <YAxis dataKey="stage" type="category" width={110} tick={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`${value}%`, 'Tỷ lệ rơi']}
                      />
                      <Bar dataKey="loss" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Root Cause Radar */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Root Cause Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={rootCauseData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="factor" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Xu Hướng Hiệu Suất (6 Tháng)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" fontSize={11} />
                      <YAxis yAxisId="left" fontSize={11} />
                      <YAxis yAxisId="right" orientation="right" fontSize={11} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="conversion" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        name="Conversion %"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--chart-2))" 
                        strokeWidth={2}
                        name="Doanh thu (triệu)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Competitive Intelligence Table */}
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Bản Đồ Áp Lực Cạnh Tranh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {competitorData.map((item, idx) => (
                    <div key={idx} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{item.competitor}</p>
                          <p className="text-xs text-muted-foreground">{item.period}</p>
                        </div>
                        <Badge className={
                          item.level === 'High' ? 'bg-red-100 text-red-700' :
                          item.level === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {item.level === 'High' ? 'Cao' : item.level === 'Medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Pressure</p>
                          <p className="font-bold text-primary">{item.pressureIndex}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-bold">{item.priceScore}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Offer</p>
                          <p className="font-bold">{item.offerScore}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trust Gap</p>
                          <p className="font-bold">{item.trustGap}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
};

export default CEODashboard;
