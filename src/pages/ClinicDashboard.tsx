import { useState } from "react";
import {
  Users,
  Clock,
  AlertTriangle,
  Armchair,
  Stethoscope,
  Package,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Timer,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

// KH - Customer data
const showUpRateData = [
  { date: "20/12", rate: 85 },
  { date: "21/12", rate: 88 },
  { date: "22/12", rate: 82 },
  { date: "23/12", rate: 90 },
  { date: "24/12", rate: 87 },
  { date: "25/12", rate: 84 },
  { date: "26/12", rate: 89 },
];

const lateRateData = [
  { date: "20/12", rate: 12 },
  { date: "21/12", rate: 8 },
  { date: "22/12", rate: 15 },
  { date: "23/12", rate: 10 },
  { date: "24/12", rate: 9 },
  { date: "25/12", rate: 14 },
  { date: "26/12", rate: 11 },
];

const avgWaitTimeData = [
  { date: "20/12", time: 12 },
  { date: "21/12", time: 10 },
  { date: "22/12", time: 15 },
  { date: "23/12", time: 8 },
  { date: "24/12", time: 11 },
  { date: "25/12", time: 14 },
  { date: "26/12", time: 9 },
];

// Phòng Lab data
const labCompletionData = [
  { date: "20/12", rate: 92 },
  { date: "21/12", rate: 88 },
  { date: "22/12", rate: 95 },
  { date: "23/12", rate: 90 },
  { date: "24/12", rate: 87 },
  { date: "25/12", rate: 93 },
  { date: "26/12", rate: 91 },
];

const labDelayData = [
  { date: "20/12", count: 2 },
  { date: "21/12", count: 4 },
  { date: "22/12", count: 1 },
  { date: "23/12", count: 3 },
  { date: "24/12", count: 5 },
  { date: "25/12", count: 2 },
  { date: "26/12", count: 3 },
];

const labStatusData = [
  { date: "20/12", dangLam: 5, tre: 2, hoanThanh: 15 },
  { date: "21/12", dangLam: 7, tre: 4, hoanThanh: 12 },
  { date: "22/12", dangLam: 4, tre: 1, hoanThanh: 18 },
  { date: "23/12", dangLam: 6, tre: 3, hoanThanh: 14 },
  { date: "24/12", dangLam: 8, tre: 5, hoanThanh: 10 },
  { date: "25/12", dangLam: 3, tre: 2, hoanThanh: 16 },
  { date: "26/12", dangLam: 5, tre: 3, hoanThanh: 15 },
];

// Ghế data
const chairUsageData = [
  { name: "Ghế 1", usage: 8 },
  { name: "Ghế 2", usage: 10 },
  { name: "Ghế 3", usage: 6 },
  { name: "Ghế 4", usage: 9 },
  { name: "Ghế 5", usage: 7 },
  { name: "Ghế 6", usage: 5 },
];

const chairStatusByRoom = [
  { room: "Phòng 1", trong: 1, ban: 2, quaTai: 0 },
  { room: "Phòng 2", trong: 0, ban: 1, quaTai: 1 },
  { room: "Phòng 3", trong: 2, ban: 0, quaTai: 0 },
];

// Bác sĩ data
const casesByDoctorDataRaw = [
  { name: "BS. Trần B", cases: 8 },
  { name: "BS. Nguyễn C", cases: 10 },
  { name: "BS. Lê D", cases: 6 },
  { name: "BS. Phạm E", cases: 7 },
];
const casesByDoctorData = [...casesByDoctorDataRaw].sort((a, b) => b.cases - a.cases);

const lateRateByDoctorDataRaw = [
  { name: "BS. Trần B", rate: 5 },
  { name: "BS. Nguyễn C", rate: 8 },
  { name: "BS. Lê D", rate: 12 },
  { name: "BS. Phạm E", rate: 3 },
];
const lateRateByDoctorData = [...lateRateByDoctorDataRaw].sort((a, b) => b.rate - a.rate);

const avgCaseDurationData = [
  { date: "20/12", duration: 45 },
  { date: "21/12", duration: 42 },
  { date: "22/12", duration: 48 },
  { date: "23/12", duration: 40 },
  { date: "24/12", duration: 44 },
  { date: "25/12", duration: 50 },
  { date: "26/12", duration: 43 },
];

const caseVariationData = [
  { date: "20/12", variation: 2, avg: 30 },
  { date: "21/12", variation: -3, avg: 30 },
  { date: "22/12", variation: 5, avg: 30 },
  { date: "23/12", variation: 0, avg: 30 },
  { date: "24/12", variation: 4, avg: 30 },
  { date: "25/12", variation: -5, avg: 30 },
  { date: "26/12", variation: 1, avg: 30 },
];

// Vật tư data
const dailyUsageData = [
  { date: "20/12", usage: 45 },
  { date: "21/12", usage: 52 },
  { date: "22/12", usage: 38 },
  { date: "23/12", usage: 48 },
  { date: "24/12", usage: 55 },
  { date: "25/12", usage: 30 },
  { date: "26/12", usage: 42 },
];

const lowStockItems = [
  { name: "Găng tay nitrile", current: 50, min: 100, status: "critical" },
  { name: "Cement dán mắc cài", current: 15, min: 20, status: "warning" },
  { name: "Composite trám răng", current: 8, min: 10, status: "warning" },
];

const endOfDayStockDataRaw = [
  { name: "Vật liệu chỉnh nha", stock: 150 },
  { name: "Vật tư tiêu hao", stock: 200 },
  { name: "Thuốc & Hóa chất", stock: 80 },
  { name: "Dụng cụ", stock: 120 },
];
const endOfDayStockData = [...endOfDayStockDataRaw].sort((a, b) => b.stock - a.stock);

const ClinicDashboard = () => {
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
          {/* Page Title with Live Indicator */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bảng điều khiển Phòng Khám</h1>
              <p className="text-muted-foreground">Ops Daily - Khách hàng, Lab, Ghế, Bác sĩ, Vật tư</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-success/10 px-4 py-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <span className="text-sm font-medium text-success">Daily</span>
            </div>
          </div>

          {/* KH Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Khách Hàng
            </h2>
            <div className="grid gap-4 sm:grid-cols-3 mb-4">
              <KPICard
                title="Show-up Rate"
                value="87%"
                change={2.5}
                changeLabel="so với hôm qua"
                icon={<CheckCircle className="h-5 w-5" />}
                variant="primary"
              />
              <KPICard
                title="Tỉ lệ KH trễ hẹn"
                value="11%"
                change={-3.2}
                changeLabel="so với hôm qua"
                icon={<Clock className="h-5 w-5" />}
              />
              <KPICard
                title="Thời gian chờ TB"
                value="9 phút"
                change={-2}
                changeLabel="so với hôm qua"
                icon={<Timer className="h-5 w-5" />}
              />
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Show-up Rate (Theo ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={showUpRateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[70, 100]} fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Show-up Rate']} />
                      <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tỉ lệ KH trễ hẹn (Theo ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={lateRateData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[0, 20]} fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Tỉ lệ trễ']} />
                      <Line type="monotone" dataKey="rate" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thời gian chờ TB (Theo ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={avgWaitTimeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} tickFormatter={(v) => `${v}p`} />
                      <Tooltip formatter={(v: number) => [`${v} phút`, 'Thời gian chờ']} />
                      <Line type="monotone" dataKey="time" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Lab Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Phòng Lab
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tỉ suất hoàn thành đúng hạn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={labCompletionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[80, 100]} fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Hoàn thành đúng hạn']} />
                      <Line type="monotone" dataKey="rate" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Số ca trễ Lab</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={labDelayData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v: number) => [`${v} ca`, 'Ca trễ']} />
                      <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Đơn Lab theo trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={labStatusData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="dangLam" stackId="a" fill="hsl(var(--chart-2))" name="Đang làm" />
                      <Bar dataKey="tre" stackId="a" fill="hsl(var(--destructive))" name="Trễ" />
                      <Bar dataKey="hoanThanh" stackId="a" fill="hsl(var(--success))" name="Hoàn thành" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Ghế Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Armchair className="h-5 w-5 text-primary" />
              Ghế
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Hiệu suất sử dụng ghế (Số ca/ghế)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chairUsageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v: number) => [`${v} ca`, 'Số ca']} />
                      <Bar dataKey="usage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái ghế theo phòng (Heatmap)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chairStatusByRoom.map((room) => (
                      <div key={room.room} className="flex items-center gap-4">
                        <span className="w-20 text-sm font-medium">{room.room}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div className={`p-3 rounded text-center text-xs font-medium ${room.trong > 0 ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                            Trống: {room.trong}
                          </div>
                          <div className={`p-3 rounded text-center text-xs font-medium ${room.ban > 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            Bận: {room.ban}
                          </div>
                          <div className={`p-3 rounded text-center text-xs font-medium ${room.quaTai > 0 ? 'bg-destructive/20 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                            Quá tải: {room.quaTai}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Bác sĩ Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Bác Sĩ
            </h2>
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Số ca/ngày/bác sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={casesByDoctorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                      <Tooltip formatter={(v: number) => [`${v} ca`, 'Số ca']} />
                      <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">% ca trễ theo bác sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={lateRateByDoctorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" domain={[0, 20]} fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <YAxis dataKey="name" type="category" width={80} fontSize={10} />
                      <Tooltip formatter={(v: number) => [`${v}%`, 'Tỉ lệ trễ']} />
                      <Bar dataKey="rate" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thời gian ca TB (phút)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={avgCaseDurationData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[30, 60]} fontSize={11} />
                      <Tooltip formatter={(v: number) => [`${v} phút`, 'Thời gian TB']} />
                      <Line type="monotone" dataKey="duration" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Biến động số ca (± so với TB 7 ngày)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={caseVariationData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis domain={[-10, 10]} fontSize={11} />
                      <Tooltip formatter={(v: number) => [v > 0 ? `+${v}` : `${v}`, 'Biến động']} />
                      <Line type="monotone" dataKey="variation" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Vật tư Section */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Vật Tư
            </h2>
            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tiêu hao vật tư/ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dailyUsageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v: number) => [`${v} đơn vị`, 'Tiêu hao']} />
                      <Line type="monotone" dataKey="usage" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Vật tư gần hết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Tồn: {item.current} / Ngưỡng: {item.min}
                          </p>
                        </div>
                        <Badge className={item.status === 'critical' ? 'bg-destructive/20 text-destructive' : 'bg-yellow-100 text-yellow-700'}>
                          {item.status === 'critical' ? 'Nguy hiểm' : 'Cảnh báo'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tồn kho cuối ngày</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={endOfDayStockData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" fontSize={11} />
                      <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                      <Tooltip formatter={(v: number) => [`${v} đơn vị`, 'Tồn kho']} />
                      <Bar dataKey="stock" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ClinicDashboard;
