import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  Heart,
  Star,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Search,
  Plus,
  ArrowLeft,
  X,
  Loader2,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Mock customers list data
const initialCustomers = [
  { id: 1, name: "Nguyễn Văn A", phone: "0912 345 678", source: "Facebook Ads", lastVisit: "20/12/2024", status: "VIP", totalSpent: "45,000,000₫" },
  { id: 2, name: "Trần Thị B", phone: "0923 456 789", source: "Google Ads", lastVisit: "18/12/2024", status: "Active", totalSpent: "12,500,000₫" },
  { id: 3, name: "Lê Văn C", phone: "0934 567 890", source: "Giới thiệu", lastVisit: "15/12/2024", status: "Chờ Thanh Toán", totalSpent: "8,000,000₫" },
  { id: 4, name: "Phạm Thị D", phone: "0945 678 901", source: "Walk-in", lastVisit: "10/12/2024", status: "Active", totalSpent: "3,200,000₫" },
  { id: 5, name: "Hoàng Văn E", phone: "0956 789 012", source: "Facebook Ads", lastVisit: "05/12/2024", status: "Mới", totalSpent: "0₫" },
  { id: 6, name: "Vũ Thị F", phone: "0967 890 123", source: "Google Ads", lastVisit: "01/12/2024", status: "VIP", totalSpent: "78,500,000₫" },
  { id: 7, name: "Đặng Văn G", phone: "0978 901 234", source: "Giới thiệu", lastVisit: "28/11/2024", status: "Active", totalSpent: "15,000,000₫" },
  { id: 8, name: "Bùi Thị H", phone: "0989 012 345", source: "Walk-in", lastVisit: "25/11/2024", status: "Chờ Thanh Toán", totalSpent: "22,000,000₫" },
];

const treatmentHistory = [
  { date: "20/12/2024", service: "Tái khám niềng răng", doctor: "BS. Trần Văn B", status: "Hoàn thành", cost: "500,000₫" },
  { date: "15/11/2024", service: "Điều chỉnh mắc cài", doctor: "BS. Trần Văn B", status: "Hoàn thành", cost: "800,000₫" },
  { date: "01/10/2024", service: "Lắp mắc cài", doctor: "BS. Trần Văn B", status: "Hoàn thành", cost: "35,000,000₫" },
  { date: "25/09/2024", service: "Tư vấn niềng răng", doctor: "BS. Nguyễn Thị C", status: "Hoàn thành", cost: "0₫" },
];

const paymentHistory = [
  { date: "01/10/2024", desc: "Đặt cọc niềng răng", amount: "10,000,000₫", type: "Thanh toán" },
  { date: "15/11/2024", desc: "Thanh toán đợt 2", amount: "15,000,000₫", type: "Thanh toán" },
  { date: "20/12/2024", desc: "Thanh toán đợt 3", amount: "10,000,000₫", type: "Thanh toán" },
];

const quotations = [
  { id: "BG001", service: "Niềng răng mắc cài kim loại", price: "45,000,000₫", status: "Đã chấp nhận", date: "25/09/2024" },
  { id: "BG002", service: "Tẩy trắng răng", price: "3,500,000₫", status: "Đang chờ", date: "20/12/2024" },
];

const statusColors: Record<string, string> = {
  "VIP": "bg-primary/20 text-primary",
  "Active": "bg-green-100 text-green-700",
  "Mới": "bg-blue-100 text-blue-700",
  "Chờ Thanh Toán": "bg-yellow-100 text-yellow-700",
};

export default function CustomerHub() {
  const [view, setView] = useState<"list" | "profile">("list");
  const [customers, setCustomers] = useState(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof initialCustomers[0] | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    source: "",
    need: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!newCustomer.name.trim()) errors.name = "Trường này bắt buộc";
    if (!newCustomer.phone.trim()) errors.phone = "Trường này bắt buộc";
    if (!newCustomer.source) errors.source = "Vui lòng chọn nguồn đến";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCustomer = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newId = Math.max(...customers.map((c) => c.id)) + 1;
    const customer = {
      id: newId,
      name: newCustomer.name,
      phone: newCustomer.phone,
      source: newCustomer.source,
      lastVisit: new Date().toLocaleDateString("vi-VN"),
      status: "Mới",
      totalSpent: "0₫",
    };

    setCustomers([customer, ...customers]);
    setIsSubmitting(false);
    setIsAddDialogOpen(false);
    setNewCustomer({ name: "", phone: "", email: "", source: "", need: "", notes: "" });
    setFormErrors({});

    toast({
      title: "Thêm khách hàng thành công!",
      description: `Khách hàng ${customer.name} đã được thêm vào danh sách.`,
    });
  };

  const handleViewProfile = (customer: typeof initialCustomers[0]) => {
    setSelectedCustomer(customer);
    setView("profile");
  };

  const patientData = selectedCustomer || {
    name: "Nguyễn Văn A",
    phone: "0912 345 678",
    email: "nguyenvana@email.com",
    dob: "15/03/1990",
    source: "Facebook Ads",
    firstVisit: "10/01/2024",
    totalSpent: "45,000,000₫",
    visits: 8,
    status: "VIP",
  };

  // List View
  if (view === "list") {
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
                  Danh Sách Khách Hàng
                </h1>
                <p className="text-muted-foreground">Quản lý toàn diện thông tin bệnh nhân</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất Danh Sách Excel
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Khách Hàng Mới
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc SĐT..."
                  className="pl-10 border-primary/30 focus:border-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="new">Mới</SelectItem>
                  <SelectItem value="pending">Chờ Thanh Toán</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customer Table */}
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Họ Tên</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">SĐT</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Nguồn Đến</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Lần Khám Cuối</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Tổng Chi Tiêu</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Trạng Thái</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCustomers.map((customer, idx) => (
                      <tr
                        key={customer.id}
                        className={`border-b cursor-pointer transition-colors hover:bg-primary/5 ${
                          idx === 0 && customers[0].id === customer.id ? "bg-primary/10 animate-pulse" : ""
                        }`}
                        onClick={() => handleViewProfile(customer)}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <span className="font-medium">{customer.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{customer.phone}</td>
                        <td className="px-4 py-4 text-muted-foreground">{customer.source}</td>
                        <td className="px-4 py-4 text-muted-foreground">{customer.lastVisit}</td>
                        <td className="px-4 py-4 font-medium text-primary">{customer.totalSpent}</td>
                        <td className="px-4 py-4">
                          <Badge className={statusColors[customer.status] || "bg-muted"}>
                            {customer.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Add Customer Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-primary" />
                    Thêm Khách Hàng Mới
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      Họ và Tên <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Nhập họ tên khách hàng"
                      className={formErrors.name ? "border-destructive" : "focus:border-primary"}
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    />
                    {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      Số điện thoại <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      className={formErrors.phone ? "border-destructive" : "focus:border-primary"}
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    />
                    {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Nhập email (tùy chọn)"
                      className="focus:border-primary"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-1">
                      Nguồn đến <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={newCustomer.source}
                      onValueChange={(value) => setNewCustomer({ ...newCustomer, source: value })}
                    >
                      <SelectTrigger className={formErrors.source ? "border-destructive" : ""}>
                        <SelectValue placeholder="Chọn nguồn đến" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                        <SelectItem value="Google Ads">Google Ads</SelectItem>
                        <SelectItem value="Giới thiệu">Giới thiệu</SelectItem>
                        <SelectItem value="Walk-in">Walk-in</SelectItem>
                        <SelectItem value="Zalo">Zalo</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.source && <p className="text-xs text-destructive">{formErrors.source}</p>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="need">Nhu cầu ban đầu</Label>
                    <Textarea
                      id="need"
                      placeholder="Nhập nhu cầu của khách hàng..."
                      className="min-h-20 focus:border-primary"
                      value={newCustomer.need}
                      onChange={(e) => setNewCustomer({ ...newCustomer, need: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Ghi chú</Label>
                    <Textarea
                      id="notes"
                      placeholder="Ghi chú thêm..."
                      className="min-h-16 focus:border-primary"
                      value={newCustomer.notes}
                      onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={handleAddCustomer}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Gửi
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    );
  }

  // Profile View
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />
      <div className="pl-64">
        <DashboardHeader />
        <main className="p-6">
          {/* Back Button & Page Title */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView("list")}
                className="hover:bg-primary/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Hồ Sơ Khách Hàng 360°: {patientData.name}
                </h1>
                <p className="text-muted-foreground">Quản lý toàn diện thông tin bệnh nhân</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="30days">30 ngày qua</SelectItem>
                  <SelectItem value="90days">90 ngày qua</SelectItem>
                  <SelectItem value="year">Năm nay</SelectItem>
                </SelectContent>
              </Select>
              <Button className="bg-primary hover:bg-primary/90">
                <FileText className="mr-2 h-4 w-4" />
                Xuất Hồ Sơ
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {/* Left Column - Patient Info */}
            <div className="space-y-6">
              {/* Patient Card */}
              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{patientData.name}</h3>
                    <Badge className={statusColors[(patientData as any).status] || "bg-primary/20 text-primary"}>
                      {(patientData as any).status}
                    </Badge>
                    
                    <div className="mt-4 w-full space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{patientData.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{(patientData as any).email || "Chưa cập nhật"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Nguồn: {patientData.source}</span>
                      </div>
                    </div>

                    <div className="mt-4 grid w-full grid-cols-2 gap-4 border-t pt-4">
                      <div>
                        <p className="text-2xl font-bold text-primary">8</p>
                        <p className="text-xs text-muted-foreground">Lượt khám</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-primary">{patientData.totalSpent}</p>
                        <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Tabs Content */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 grid w-full grid-cols-5 bg-muted">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Tổng quan
                  </TabsTrigger>
                  <TabsTrigger value="checkin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Tiếp nhận
                  </TabsTrigger>
                  <TabsTrigger value="sales" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Tư vấn & Báo giá
                  </TabsTrigger>
                  <TabsTrigger value="treatment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Điều trị
                  </TabsTrigger>
                  <TabsTrigger value="payment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Thanh toán
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <TrendingUp className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Nguồn đến</p>
                            <p className="font-semibold">{patientData.source}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Trạng thái</p>
                            <p className="font-semibold">Đang điều trị</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                            <Clock className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Lịch hẹn kế tiếp</p>
                            <p className="font-semibold">05/01/2025</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Star className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Đánh giá</p>
                            <p className="font-semibold">5/5 ⭐</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Treatment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch sử điều trị gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {treatmentHistory.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                <Calendar className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{item.service}</p>
                                <p className="text-sm text-muted-foreground">{item.date} - {item.doctor}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
                              <p className="mt-1 text-sm font-medium text-primary">{item.cost}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Check-in Tab */}
                <TabsContent value="checkin" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Thông tin tiếp nhận</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Họ và tên</Label>
                          <Input value={patientData.name} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Số điện thoại</Label>
                          <Input value={patientData.phone} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Nguồn đến</Label>
                          <Input value={patientData.source} readOnly />
                        </div>
                        <div className="space-y-2">
                          <Label>Ngày đăng ký</Label>
                          <Input value="10/01/2024" readOnly />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label>Nhu cầu ban đầu</Label>
                        <Textarea className="mt-2" value="Niềng răng, tư vấn về các phương pháp chỉnh nha" readOnly />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Báo giá</CardTitle>
                      <Button size="sm" className="bg-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Lập Báo Giá
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {quotations.map((quote) => (
                          <div key={quote.id} className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{quote.service}</p>
                                <Badge variant="outline">{quote.id}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{quote.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{quote.price}</p>
                              <Badge className={quote.status === "Đã chấp nhận" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                                {quote.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Treatment Tab */}
                <TabsContent value="treatment" className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Phác đồ điều trị</CardTitle>
                      <Button size="sm" className="bg-primary">
                        <Plus className="mr-2 h-4 w-4" />
                        Ghi Nhận Session
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {treatmentHistory.map((item, idx) => (
                          <div key={idx} className="relative border-l-2 border-primary/30 pl-6 pb-6 last:pb-0">
                            <div className="absolute -left-2 top-0 h-4 w-4 rounded-full bg-primary" />
                            <div className="rounded-lg border p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{item.service}</p>
                                  <p className="text-sm text-muted-foreground">{item.doctor}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">{item.date}</p>
                                  <Badge className="bg-green-100 text-green-700">{item.status}</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Tổng giá trị</p>
                        <p className="text-2xl font-bold text-primary">45,000,000₫</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Đã thanh toán</p>
                        <p className="text-2xl font-bold text-green-600">35,000,000₫</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Còn nợ</p>
                        <p className="text-2xl font-bold text-yellow-600">10,000,000₫</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lịch sử thanh toán</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentHistory.map((payment, idx) => (
                          <div key={idx} className="flex items-center justify-between border-b pb-3 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                                <CreditCard className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <p className="font-medium">{payment.desc}</p>
                                <p className="text-sm text-muted-foreground">{payment.date}</p>
                              </div>
                            </div>
                            <p className="font-bold text-green-600">+{payment.amount}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Tiến độ thanh toán</span>
                          <span className="font-medium">78%</span>
                        </div>
                        <Progress value={78} className="h-3" />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
