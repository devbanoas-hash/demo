import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Plus,
  Minus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Box,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "recharts";

const inventoryData = [
  { id: 1, name: "Mắc cài kim loại", quantity: 150, threshold: 50, unit: "bộ", status: "normal", dailyUsage: 5 },
  { id: 2, name: "Dây cung niềng", quantity: 80, threshold: 30, unit: "cuộn", status: "normal", dailyUsage: 3 },
  { id: 3, name: "Cement dán mắc cài", quantity: 15, threshold: 20, unit: "hộp", status: "warning", dailyUsage: 2 },
  { id: 4, name: "Gạc y tế", quantity: 200, threshold: 100, unit: "gói", status: "normal", dailyUsage: 10 },
  { id: 5, name: "Găng tay nitrile", quantity: 50, threshold: 100, unit: "hộp", status: "critical", dailyUsage: 8 },
  { id: 6, name: "Thuốc tê Lidocaine", quantity: 25, threshold: 15, unit: "ống", status: "normal", dailyUsage: 4 },
  { id: 7, name: "Composite trám răng", quantity: 8, threshold: 10, unit: "tuýp", status: "warning", dailyUsage: 1 },
  { id: 8, name: "Chỉ khâu tự tiêu", quantity: 40, threshold: 20, unit: "hộp", status: "normal", dailyUsage: 2 },
];

const usageTrend = [
  { date: "20/12", value: 45 },
  { date: "21/12", value: 52 },
  { date: "22/12", value: 38 },
  { date: "23/12", value: 48 },
  { date: "24/12", value: 55 },
  { date: "25/12", value: 30 },
  { date: "26/12", value: 42 },
];

const categoryStock = [
  { category: "Vật liệu chỉnh nha", value: 85 },
  { category: "Vật tư tiêu hao", value: 65 },
  { category: "Thuốc & Hóa chất", value: 72 },
  { category: "Dụng cụ", value: 90 },
];

const recentTransactions = [
  { date: "26/12/2024", type: "Nhập", item: "Mắc cài kim loại", quantity: 50, by: "Nguyễn Văn A" },
  { date: "26/12/2024", type: "Xuất", item: "Găng tay nitrile", quantity: 10, by: "BS. Trần B" },
  { date: "25/12/2024", type: "Xuất", item: "Gạc y tế", quantity: 20, by: "BS. Lê C" },
  { date: "25/12/2024", type: "Nhập", item: "Thuốc tê Lidocaine", quantity: 30, by: "Nguyễn Văn A" },
];

export default function MaterialHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const criticalItems = inventoryData.filter(item => item.status === "critical").length;
  const warningItems = inventoryData.filter(item => item.status === "warning").length;

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6">
          {/* Page Title */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Vật Tư Hub - Quản Lý Tồn Kho
              </h1>
              <p className="text-muted-foreground">Theo dõi và quản lý vật tư phòng khám</p>
            </div>
            <div className="flex gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Minus className="mr-2 h-4 w-4" />
                    Xuất Kho
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Xuất Kho Vật Tư</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chọn vật tư</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vật tư..." />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryData.map(item => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name} (Tồn: {item.quantity} {item.unit})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số lượng</label>
                      <Input type="number" placeholder="Nhập số lượng..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lý do xuất</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn lý do..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="treatment">Sử dụng điều trị</SelectItem>
                          <SelectItem value="damage">Hư hỏng</SelectItem>
                          <SelectItem value="expired">Hết hạn</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-primary">Xác Nhận Xuất Kho</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Nhập Kho
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nhập Kho Vật Tư</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chọn vật tư</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vật tư..." />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryData.map(item => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Số lượng</label>
                      <Input type="number" placeholder="Nhập số lượng..." />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nhà cung cấp</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn NCC..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ncc1">Công ty Nha Khoa ABC</SelectItem>
                          <SelectItem value="ncc2">Vật tư Y tế XYZ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-primary">Xác Nhận Nhập Kho</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Alert Banner */}
          {criticalItems > 0 && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div className="flex-1">
                <p className="font-semibold text-destructive">Cảnh báo: {criticalItems} vật tư sắp hết!</p>
                <p className="text-sm text-muted-foreground">Cần bổ sung ngay để tránh gián đoạn hoạt động</p>
              </div>
              <Button variant="destructive" size="sm">Xem Chi Tiết</Button>
            </div>
          )}

          {/* Stats Row */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{inventoryData.length}</p>
                    <p className="text-sm text-muted-foreground">Loại vật tư</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">42</p>
                    <p className="text-sm text-muted-foreground">Tiêu hao hôm nay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{warningItems}</p>
                    <p className="text-sm text-muted-foreground">Cần bổ sung sớm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{criticalItems}</p>
                    <p className="text-sm text-muted-foreground">Sắp hết hàng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Inventory Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Danh Sách Tồn Kho</CardTitle>
                    <div className="flex gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm..."
                          className="pl-9 w-48"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          <SelectItem value="normal">Bình thường</SelectItem>
                          <SelectItem value="warning">Cảnh báo</SelectItem>
                          <SelectItem value="critical">Nguy hiểm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredInventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            item.status === 'critical' ? 'bg-red-100' :
                            item.status === 'warning' ? 'bg-yellow-100' : 'bg-primary/10'
                          }`}>
                            <Box className={`h-5 w-5 ${
                              item.status === 'critical' ? 'text-red-600' :
                              item.status === 'warning' ? 'text-yellow-600' : 'text-primary'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Tiêu thụ TB: {item.dailyUsage} {item.unit}/ngày
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="w-32">
                            <div className="mb-1 flex justify-between text-xs">
                              <span>{item.quantity} {item.unit}</span>
                              <span>/{item.threshold}</span>
                            </div>
                            <Progress 
                              value={Math.min((item.quantity / (item.threshold * 3)) * 100, 100)} 
                              className={`h-2 ${
                                item.status === 'critical' ? '[&>div]:bg-red-500' :
                                item.status === 'warning' ? '[&>div]:bg-yellow-500' : ''
                              }`}
                            />
                          </div>
                          <Badge className={
                            item.status === 'critical' ? 'bg-red-100 text-red-700' :
                            item.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }>
                            {item.status === 'critical' ? 'Nguy hiểm' :
                             item.status === 'warning' ? 'Cảnh báo' : 'Bình thường'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>Giao Dịch Gần Đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTransactions.map((tx, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            tx.type === 'Nhập' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'Nhập' ? (
                              <ArrowDownRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.item}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${tx.type === 'Nhập' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'Nhập' ? '+' : '-'}{tx.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Charts Row */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Usage Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Xu Hướng Tiêu Hao (7 Ngày)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={usageTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Stock */}
            <Card>
              <CardHeader>
                <CardTitle>Tồn Kho Theo Danh Mục (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={categoryStock} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="category" type="category" width={140} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Tồn kho']}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
