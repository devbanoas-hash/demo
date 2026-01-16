import { useState } from 'react';
import { useOrderStore } from '@/store/orderStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { IUser } from '@/types/user';
import { TUserStatus, userStatusLabels } from '@/constants/user.constant';
import { roleLabels, TRoleName } from '@/constants/role.constant';
import { toast } from 'sonner';

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useOrderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<{
    username: string;
    email: string;
    password: string;
    role: { role_id: string; role_name: string; created_at: string };
    status: TUserStatus;
  }>({
    username: '',
    email: '',
    password: '',
    role: { role_id: '1', role_name: 'sales', created_at: new Date().toISOString() },
    status: 'online',
  });

  const handleEdit = (user: IUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: user.password,
      role: user.role,
      status: user.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa người dùng này?')) {
      deleteUser(id);
      toast.success('Đã xóa người dùng');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUser(editingUser.user_id, formData);
      toast.success('Đã cập nhật người dùng');
    } else {
      addUser(formData);
      toast.success('Đã thêm người dùng');
    }
    handleClose();
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: { role_id: '1', role_name: 'sales', created_at: new Date().toISOString() },
      status: 'online',
    });
  };

  const handleNew = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: { role_id: '1', role_name: 'sales', created_at: new Date().toISOString() },
      status: 'online',
    });
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'bg-primary/20 text-primary';
      case 'sales':
        return 'bg-status-new/20 text-status-new';
      case 'shipper':
        return 'bg-status-delivering/20 text-status-delivering';
      case 'kitchen_lead':
        return 'bg-amber-100 text-amber-700';
      case 'kitchen_staff':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div />
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Danh sách người dùng ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có người dùng nào
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role.role_name)}`}>
                        {roleLabels[user.role.role_name as TRoleName] || user.role.role_name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded text-xs ${user.status === 'online' ? 'bg-status-completed/20 text-status-completed' : 'bg-muted text-muted-foreground'}`}>
                        {userStatusLabels[user.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(user.user_id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Sửa người dùng' : 'Thêm người dùng'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vai trò *</Label>
              <Select
                value={formData.role.role_name}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    role: { ...formData.role, role_name: value },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="sales">Nhân viên bán hàng</SelectItem>
                  <SelectItem value="shipper">Người giao hàng</SelectItem>
                  <SelectItem value="kitchen_lead">Quản lý bếp</SelectItem>
                  <SelectItem value="kitchen_staff">Nhân viên bếp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TUserStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="online">Hoạt động</SelectItem>
                  <SelectItem value="offline">Ngưng hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>Hủy</Button>
              <Button type="submit">{editingUser ? 'Cập nhật' : 'Thêm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
