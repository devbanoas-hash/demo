import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Stethoscope,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Star,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
  X,
  Loader2,
  CheckCircle2,
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { toast } from "@/hooks/use-toast";

const initialDoctors = [
  { id: 1, name: "BS. Trần Văn B", specialty: "Chỉnh nha", phone: "0912 111 222", email: "tranvanb@clinic.vn", rating: 4.9, patients: 156, utilization: 85 },
  { id: 2, name: "BS. Nguyễn Thị C", specialty: "Nha tổng quát", phone: "0912 222 333", email: "nguyenthic@clinic.vn", rating: 4.8, patients: 203, utilization: 78 },
  { id: 3, name: "BS. Lê Văn D", specialty: "Phẫu thuật", phone: "0912 333 444", email: "levand@clinic.vn", rating: 4.7, patients: 89, utilization: 92 },
  { id: 4, name: "BS. Phạm Thị E", specialty: "Nhi khoa", phone: "0912 444 555", email: "phamthie@clinic.vn", rating: 4.9, patients: 178, utilization: 70 },
];

const initialScheduleData = [
  { time: "08:00", doctor1: "Nguyễn Văn A", doctor2: "Trần Thị B", doctor3: "", doctor4: "Lê Văn C" },
  { time: "09:00", doctor1: "Phạm Văn D", doctor2: "", doctor3: "Hoàng Thị E", doctor4: "" },
  { time: "10:00", doctor1: "", doctor2: "Vũ Văn F", doctor3: "Đặng Thị G", doctor4: "Bùi Văn H" },
  { time: "11:00", doctor1: "Đỗ Văn I", doctor2: "Ngô Thị K", doctor3: "", doctor4: "" },
  { time: "14:00", doctor1: "Dương Văn L", doctor2: "", doctor3: "Lý Thị M", doctor4: "Trịnh Văn N" },
  { time: "15:00", doctor1: "", doctor2: "Đinh Thị O", doctor3: "Hà Văn P", doctor4: "" },
  { time: "16:00", doctor1: "Võ Văn Q", doctor2: "Mai Thị R", doctor3: "", doctor4: "Phan Văn S" },
];

const workloadData = [
  { name: "BS. Trần Văn B", cases: 8, target: 10 },
  { name: "BS. Nguyễn Thị C", cases: 10, target: 10 },
  { name: "BS. Lê Văn D", cases: 6, target: 8 },
  { name: "BS. Phạm Thị E", cases: 7, target: 10 },
];

const weeklyTrend = [
  { day: "T2", cases: 32 },
  { day: "T3", cases: 28 },
  { day: "T4", cases: 35 },
  { day: "T5", cases: 30 },
  { day: "T6", cases: 38 },
  { day: "T7", cases: 25 },
  { day: "CN", cases: 15 },
];

const calendarDays = [
  { day: 23, hasAppointment: false },
  { day: 24, hasAppointment: true, count: 12 },
  { day: 25, hasAppointment: true, count: 8 },
  { day: 26, hasAppointment: true, count: 15, isToday: true },
  { day: 27, hasAppointment: true, count: 10 },
  { day: 28, hasAppointment: true, count: 6 },
  { day: 29, hasAppointment: false },
];

const patientOptions = [
  "Nguyễn Văn A",
  "Trần Thị B",
  "Lê Văn C",
  "Phạm Thị D",
  "Hoàng Văn E",
  "Vũ Thị F",
];

export default function DoctorHub() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [scheduleData, setScheduleData] = useState(initialScheduleData);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialty: "",
    phone: "",
    email: "",
    notes: "",
  });

  const [editDoctor, setEditDoctor] = useState<typeof initialDoctors[0] | null>(null);

  const [newShift, setNewShift] = useState({
    time: "",
    patient: "",
    doctor: "",
  });

  const validateDoctorForm = () => {
    const errors: Record<string, string> = {};
    if (!newDoctor.name.trim()) errors.name = "Trường này bắt buộc";
    if (!newDoctor.specialty) errors.specialty = "Vui lòng chọn chuyên môn";
    if (!newDoctor.phone.trim()) errors.phone = "Trường này bắt buộc";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateShiftForm = () => {
    const errors: Record<string, string> = {};
    if (!newShift.time) errors.time = "Vui lòng chọn giờ";
    if (!newShift.patient) errors.patient = "Vui lòng chọn bệnh nhân";
    if (!newShift.doctor) errors.doctor = "Vui lòng chọn bác sĩ";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDoctor = async () => {
    if (!validateDoctorForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newId = Math.max(...doctors.map((d) => d.id)) + 1;
    const doctor = {
      id: newId,
      name: newDoctor.name,
      specialty: newDoctor.specialty,
      phone: newDoctor.phone,
      email: newDoctor.email,
      rating: 5.0,
      patients: 0,
      utilization: 0,
    };

    setDoctors([doctor, ...doctors]);
    setIsSubmitting(false);
    setIsAddDoctorOpen(false);
    setNewDoctor({ name: "", specialty: "", phone: "", email: "", notes: "" });
    setFormErrors({});

    toast({
      title: "Thêm bác sĩ thành công!",
      description: `Bác sĩ ${doctor.name} đã được thêm vào danh sách.`,
    });
  };

  const handleEditDoctor = async () => {
    if (!editDoctor) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDoctors(doctors.map((d) => (d.id === editDoctor.id ? editDoctor : d)));
    setIsSubmitting(false);
    setIsEditDoctorOpen(false);
    setEditDoctor(null);

    toast({
      title: "Cập nhật thành công!",
      description: "Thông tin bác sĩ đã được cập nhật.",
    });
  };

  const handleAddShift = async () => {
    if (!validateShiftForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const newSchedule = [...scheduleData];
    const existingRow = newSchedule.find((r) => r.time === newShift.time);
    if (existingRow) {
      if (!existingRow.doctor1) existingRow.doctor1 = newShift.patient;
      else if (!existingRow.doctor2) existingRow.doctor2 = newShift.patient;
      else if (!existingRow.doctor3) existingRow.doctor3 = newShift.patient;
      else if (!existingRow.doctor4) existingRow.doctor4 = newShift.patient;
    } else {
      newSchedule.push({
        time: newShift.time,
        doctor1: newShift.patient,
        doctor2: "",
        doctor3: "",
        doctor4: "",
      });
    }

    setScheduleData(newSchedule);
    setIsSubmitting(false);
    setIsAddShiftOpen(false);
    setNewShift({ time: "", patient: "", doctor: "" });
    setFormErrors({});

    toast({
      title: "Ca làm đã được thêm!",
      description: `Đã thêm ca làm lúc ${newShift.time} cho ${newShift.patient}.`,
    });
  };

  const openEditDialog = (doctor: typeof initialDoctors[0]) => {
    setEditDoctor({ ...doctor });
    setIsEditDoctorOpen(true);
  };

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
                Doctor Hub - Quản Lý Bác Sĩ
              </h1>
              <p className="text-muted-foreground">Theo dõi lịch làm việc và hiệu suất bác sĩ</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsAssignOpen(true)}>
                <Calendar className="mr-2 h-4 w-4" />
                Phân Bổ Bác Sĩ
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setIsAddDoctorOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm Bác Sĩ Mới
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Stethoscope className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doctors.length}</p>
                    <p className="text-sm text-muted-foreground">Bác sĩ đang làm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">31</p>
                    <p className="text-sm text-muted-foreground">Ca hôm nay</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">82%</p>
                    <p className="text-sm text-muted-foreground">Hiệu suất TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.8</p>
                    <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Doctor Cards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Danh Sách Bác Sĩ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {doctors.map((doctor, idx) => (
                      <Card 
                        key={doctor.id} 
                        className={`cursor-pointer transition-all hover:border-primary/50 ${
                          selectedDoctor === doctor.id ? 'border-primary' : ''
                        } ${idx === 0 && doctors[0].patients === 0 ? 'ring-2 ring-primary/50 animate-pulse' : ''}`}
                        onClick={() => setSelectedDoctor(doctor.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                              <Stethoscope className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{doctor.name}</h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(doctor);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                              
                              <div className="mt-2 flex items-center gap-2">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="text-sm font-medium">{doctor.rating}</span>
                                <span className="text-sm text-muted-foreground">• {doctor.patients} bệnh nhân</span>
                              </div>

                              <div className="mt-3">
                                <div className="mb-1 flex justify-between text-xs">
                                  <span>Hiệu suất</span>
                                  <span className="font-medium text-primary">{doctor.utilization}%</span>
                                </div>
                                <Progress value={doctor.utilization} className="h-2" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar */}
            <div>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Lịch Làm Việc</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-center font-medium">Tháng 12, 2024</p>
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
                    {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                      <div key={day} className="py-2 text-muted-foreground">{day}</div>
                    ))}
                    {calendarDays.map((item, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg p-2 ${
                          item.isToday 
                            ? 'bg-primary text-primary-foreground' 
                            : item.hasAppointment 
                              ? 'bg-primary/10' 
                              : ''
                        }`}
                      >
                        <span className="font-medium">{item.day}</span>
                        {item.hasAppointment && (
                          <span className={`block text-xs ${item.isToday ? 'text-primary-foreground/80' : 'text-primary'}`}>
                            {item.count} ca
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Schedule Table & Charts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Daily Schedule */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Lịch Làm Việc Hôm Nay</CardTitle>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => setIsAddShiftOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm Ca Làm
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">Giờ</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">BS. Trần B</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">BS. Nguyễn C</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">BS. Lê D</th>
                        <th className="py-2 px-3 text-left font-medium text-muted-foreground">BS. Phạm E</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-medium">{row.time}</td>
                          <td className="py-2 px-3">
                            {row.doctor1 && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {row.doctor1}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {row.doctor2 && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {row.doctor2}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {row.doctor3 && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {row.doctor3}
                              </Badge>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            {row.doctor4 && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {row.doctor4}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workload Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Số Ca/Ngày Theo Bác Sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workloadData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 12]} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="cases" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Ca thực tế" />
                    <Bar dataKey="target" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Mục tiêu" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Trend */}
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Biến Động Số Ca (Tuần)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
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
                      dataKey="cases" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                      name="Tổng ca"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Add Doctor Dialog */}
          <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Thêm Bác Sĩ Mới
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="doctorName" className="flex items-center gap-1">
                    Họ và Tên <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="doctorName"
                    placeholder="Nhập họ tên bác sĩ"
                    className={formErrors.name ? "border-destructive" : "focus:border-primary"}
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                  />
                  {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1">
                    Chuyên môn <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newDoctor.specialty}
                    onValueChange={(value) => setNewDoctor({ ...newDoctor, specialty: value })}
                  >
                    <SelectTrigger className={formErrors.specialty ? "border-destructive" : ""}>
                      <SelectValue placeholder="Chọn chuyên môn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Chỉnh nha">Chỉnh nha</SelectItem>
                      <SelectItem value="Nha tổng quát">Nha tổng quát</SelectItem>
                      <SelectItem value="Phẫu thuật">Phẫu thuật</SelectItem>
                      <SelectItem value="Nhi khoa">Nhi khoa</SelectItem>
                      <SelectItem value="Implant">Implant</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.specialty && <p className="text-xs text-destructive">{formErrors.specialty}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctorPhone" className="flex items-center gap-1">
                    Số điện thoại <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="doctorPhone"
                    placeholder="Nhập số điện thoại"
                    className={formErrors.phone ? "border-destructive" : "focus:border-primary"}
                    value={newDoctor.phone}
                    onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                  />
                  {formErrors.phone && <p className="text-xs text-destructive">{formErrors.phone}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctorEmail">Email</Label>
                  <Input
                    id="doctorEmail"
                    placeholder="Nhập email"
                    className="focus:border-primary"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="doctorNotes">Ghi chú</Label>
                  <Textarea
                    id="doctorNotes"
                    placeholder="Ghi chú thêm..."
                    className="min-h-16 focus:border-primary"
                    value={newDoctor.notes}
                    onChange={(e) => setNewDoctor({ ...newDoctor, notes: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDoctorOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddDoctor}
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
                      Thêm Bác Sĩ
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Doctor Dialog */}
          <Dialog open={isEditDoctorOpen} onOpenChange={setIsEditDoctorOpen}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary" />
                  Chỉnh Sửa Thông Tin Bác Sĩ
                </DialogTitle>
              </DialogHeader>
              {editDoctor && (
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Họ và Tên</Label>
                    <Input
                      value={editDoctor.name}
                      onChange={(e) => setEditDoctor({ ...editDoctor, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Chuyên môn</Label>
                    <Select
                      value={editDoctor.specialty}
                      onValueChange={(value) => setEditDoctor({ ...editDoctor, specialty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chỉnh nha">Chỉnh nha</SelectItem>
                        <SelectItem value="Nha tổng quát">Nha tổng quát</SelectItem>
                        <SelectItem value="Phẫu thuật">Phẫu thuật</SelectItem>
                        <SelectItem value="Nhi khoa">Nhi khoa</SelectItem>
                        <SelectItem value="Implant">Implant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Số điện thoại</Label>
                    <Input
                      value={editDoctor.phone}
                      onChange={(e) => setEditDoctor({ ...editDoctor, phone: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={editDoctor.email}
                      onChange={(e) => setEditDoctor({ ...editDoctor, email: e.target.value })}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDoctorOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleEditDoctor}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Cập Nhật"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Shift Dialog */}
          <Dialog open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Thêm Ca Làm
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1">
                    Thời gian <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newShift.time}
                    onValueChange={(value) => setNewShift({ ...newShift, time: value })}
                  >
                    <SelectTrigger className={formErrors.time ? "border-destructive" : ""}>
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="09:00">09:00</SelectItem>
                      <SelectItem value="10:00">10:00</SelectItem>
                      <SelectItem value="11:00">11:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="15:00">15:00</SelectItem>
                      <SelectItem value="16:00">16:00</SelectItem>
                    </SelectContent>
                  </Select>
                  {formErrors.time && <p className="text-xs text-destructive">{formErrors.time}</p>}
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1">
                    Bác sĩ <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newShift.doctor}
                    onValueChange={(value) => setNewShift({ ...newShift, doctor: value })}
                  >
                    <SelectTrigger className={formErrors.doctor ? "border-destructive" : ""}>
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.doctor && <p className="text-xs text-destructive">{formErrors.doctor}</p>}
                </div>
                <div className="grid gap-2">
                  <Label className="flex items-center gap-1">
                    Bệnh nhân <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={newShift.patient}
                    onValueChange={(value) => setNewShift({ ...newShift, patient: value })}
                  >
                    <SelectTrigger className={formErrors.patient ? "border-destructive" : ""}>
                      <SelectValue placeholder="Chọn bệnh nhân" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientOptions.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.patient && <p className="text-xs text-destructive">{formErrors.patient}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddShiftOpen(false)}>
                  Hủy
                </Button>
                <Button
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleAddShift}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Thêm Ca"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Doctor Assignment Dialog */}
          <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Phân Bổ Bác Sĩ
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Bác sĩ</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Ngày làm việc</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="26/12">26/12/2024 (Hôm nay)</SelectItem>
                      <SelectItem value="27/12">27/12/2024</SelectItem>
                      <SelectItem value="28/12">28/12/2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Ca làm việc</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn ca" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sang">Ca sáng (08:00 - 12:00)</SelectItem>
                      <SelectItem value="chieu">Ca chiều (13:00 - 17:00)</SelectItem>
                      <SelectItem value="toi">Ca tối (18:00 - 21:00)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
                  Hủy
                </Button>
                <Button className="bg-primary hover:bg-primary/90">
                  Phân Bổ
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
