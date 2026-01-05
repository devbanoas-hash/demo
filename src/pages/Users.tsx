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
import { User, UserRole } from '@/types';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

const roleLabels: Record<UserRole, string> = {
  admin: 'Quản trị viên',
  sales: 'Bán hàng',
  shipper: 'Shipper',
};

export default function UsersPage() {
  const { users, addUser, updateUser, deleteUser } = useOrderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<{ name: string; email: string; role: UserRole; active: boolean }>({
    name: '',
    email: '',
    role: 'sales',
    active: true,
  });

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, active: user.active });
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
      updateUser(editingUser.id, formData);
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
    setFormData({ name: '', email: '', role: 'sales', active: true });
  };

  const handleNew = () => {
    setFormData({ name: '', email: '', role: 'sales', active: true });
    setEditingUser(null);
    setIsFormOpen(true);
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-primary/20 text-primary' :
                      user.role === 'sales' ? 'bg-status-new/20 text-status-new' :
                      'bg-status-delivering/20 text-status-delivering'
                    }`}>
                      {roleLabels[user.role]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`px-2 py-1 rounded text-xs ${user.active ? 'bg-status-completed/20 text-status-completed' : 'bg-muted text-muted-foreground'}`}>
                      {user.active ? 'Hoạt động' : 'Tạm khóa'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
              <Label htmlFor="name">Tên *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              <Label>Vai trò *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="sales">Bán hàng</SelectItem>
                  <SelectItem value="shipper">Shipper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Đang hoạt động</Label>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
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