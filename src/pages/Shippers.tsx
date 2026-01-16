import { useState } from 'react';
import { useOrderStore, LegacyShipper } from '@/store/orderStore';
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
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

export default function Shippers() {
  const { shippers, addShipper, updateShipper, deleteShipper } = useOrderStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipper, setEditingShipper] = useState<LegacyShipper | null>(null);
  const [formData, setFormData] = useState({ name: '', phone: '', active: true });

  const handleEdit = (shipper: LegacyShipper) => {
    setEditingShipper(shipper);
    setFormData({ name: shipper.name, phone: shipper.phone, active: shipper.active });
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa shipper này?')) {
      deleteShipper(id);
      toast.success('Đã xóa shipper');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShipper) {
      updateShipper(editingShipper.id, formData);
      toast.success('Đã cập nhật shipper');
    } else {
      addShipper(formData);
      toast.success('Đã thêm shipper');
    }
    handleClose();
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingShipper(null);
    setFormData({ name: '', phone: '', active: true });
  };

  const handleNew = () => {
    setFormData({ name: '', phone: '', active: true });
    setEditingShipper(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div />
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Shipper
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Danh sách Shipper ({shippers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên</TableHead>
                <TableHead>Số điện thoại</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shippers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Không có shipper nào
                  </TableCell>
                </TableRow>
              ) : (
                shippers.map((shipper) => (
                  <TableRow key={shipper.id}>
                    <TableCell className="font-medium">{shipper.name}</TableCell>
                    <TableCell>{shipper.phone}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          shipper.active
                            ? 'bg-status-completed/20 text-status-completed'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {shipper.active ? 'Hoạt động' : 'Tạm nghỉ'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(shipper)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(shipper.id)}>
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
            <DialogTitle>{editingShipper ? 'Sửa Shipper' : 'Thêm Shipper'}</DialogTitle>
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
              <Label htmlFor="phone">Số điện thoại *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
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
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">{editingShipper ? 'Cập nhật' : 'Thêm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
