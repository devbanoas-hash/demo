import { useState } from 'react';
import { useCakes } from '@/hooks/useCakes';
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
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { ICake } from '@/types/cake';
import { TCakeType, TCakeStatus, cakeTypeLabels, cakeStatusLabels } from '@/constants/cake.constant';

export default function Products() {
  const { cakes, createCake, updateCake, deleteCake } = useCakes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCake, setEditingCake] = useState<ICake | null>(null);
  const [formData, setFormData] = useState<{
    cake_name: string;
    unit_price: number;
    type: TCakeType;
    status: TCakeStatus;
  }>({
    cake_name: '',
    unit_price: 0,
    type: 'european',
    status: 'available',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleEdit = (cake: ICake) => {
    setEditingCake(cake);
    setFormData({
      cake_name: cake.cake_name,
      unit_price: cake.unit_price,
      type: cake.type,
      status: cake.status,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      await deleteCake(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCake) {
      await updateCake(editingCake.cake_id, formData);
    }
    else {
      await createCake(formData as ICake);
    }
    handleClose();
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingCake(null);
    setFormData({ cake_name: '', unit_price: 0, type: 'european', status: 'available' });
  };

  const handleNew = () => {
    setFormData({ cake_name: '', unit_price: 0, type: 'european', status: 'available' });
    setEditingCake(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div />
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm sản phẩm
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Danh sách sản phẩm ({cakes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên sản phẩm</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cakes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              ) : (
                cakes.map((cake) => (
                  <TableRow key={cake.cake_id}>
                    <TableCell className="font-medium">{cake.cake_name}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          cake.type === 'european'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-pink-100 text-pink-700'
                        }`}
                      >
                        {cakeTypeLabels[cake.type]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(cake.unit_price)}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          cake.status === 'available'
                            ? 'bg-status-completed/20 text-status-completed'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {cakeStatusLabels[cake.status]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cake)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cake.cake_id)}>
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
            <DialogTitle>{editingCake ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cake_name">Tên sản phẩm *</Label>
              <Input
                id="cake_name"
                value={formData.cake_name}
                onChange={(e) => setFormData({ ...formData, cake_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Loại bánh *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TCakeType) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="european">Bánh Âu</SelectItem>
                  <SelectItem value="cream_cake">Bánh Kem</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Giá (VNĐ) *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TCakeStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="unavailable">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">{editingCake ? 'Cập nhật' : 'Thêm'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
