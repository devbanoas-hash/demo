import { useState, useEffect, useMemo } from 'react';
import { Plus, X, User, Truck, Store, ShoppingCart, Minus, Trash2, FilePlus, Save } from 'lucide-react';
import { IOrder, TCakeOrderItem, TAvailableCakeOrderItem, TCustomCakeOrderItem } from '@/types/order';
import { ICustomer } from '@/types/customer';
import { TOrderStatus, orderStatusLabels } from '@/constants/order.constant';
import { PROVINCES } from '@/constants/province.constant';
import { normalizeVi } from '@/utils/normalize';
import { useAppData } from '@/contexts/AppDataContext';
import { useAuthStore } from '@/store/authStore';
import { splitDeliveryDateTime } from '@/lib/utils';
import ImageZoomModal from './ImageZoomModal';
import { Spinner } from '../ui/spinner';

interface OrderFormModalProps {
    onClose: () => void;
    initialOrder: IOrder | null;
    onSave: (order: IOrder) => void;
    loading: boolean;
}

const OrderFormModal = ({ onClose, initialOrder, onSave, loading }: OrderFormModalProps) => {
    // Get data from context (already fetched on app initialization)
    const { customers, users, cakes, isLoading: isLoadingAppData } = useAppData();
    // Get current logged-in user
    const { user: currentUser } = useAuthStore();
    
    // Find current user in users array
    const currentLoggedInUser = useMemo(() => {
        if (!currentUser?.user_id || !users.length) return null;
        return users.find(u => u.user_id === currentUser.user_id) || null;
    }, [currentUser?.user_id, users]);

    // Phone number validation
    const [phoneError, setPhoneError] = useState<string>('');
    const [foundCustomer, setFoundCustomer] = useState<ICustomer | null>(null);

    // Delivery date/time state (separate from delivery_at)
    const today = new Date();
    const defaultDay = today.toISOString().split('T')[0];
    const defaultTime = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;
    
    const [deliveryDay, setDeliveryDay] = useState<string>(() => {
        if (initialOrder?.delivery_at) {
            const { day } = splitDeliveryDateTime(initialOrder.delivery_at);
            return day || defaultDay;
        }
        return defaultDay;
    });
    const [deliveryTime, setDeliveryTime] = useState<string>(() => {
        if (initialOrder?.delivery_at) {
            const { time } = splitDeliveryDateTime(initialOrder.delivery_at);
            return time || defaultTime;
        }
        return defaultTime;
    });

    // Generate unique order ID with 5-7 characters after ORD-
    const generateOrderId = (): string => {
        // Use timestamp (base36) + random for uniqueness
        // Date.now() gives us a unique timestamp, convert to base36 for shorter string
        const timestamp = Date.now().toString(36).toUpperCase();
        // Random number 0-1295 (36^2 - 1) converted to base36 = 2 chars
        const randomSuffix = Math.floor(Math.random() * 1296).toString(36).toUpperCase().padStart(2, '0');
        // Combine: take last 4 chars from timestamp + 2 random chars = 6 chars total
        // Or take last 5 chars from timestamp + 1 random char = 6 chars
        // Or take last 3 chars from timestamp + 2 random chars = 5 chars
        // We'll use 4 timestamp + 2 random = 6 chars (within 5-7 range)
        const suffix = `${timestamp.slice(-4)}${randomSuffix}`;
        return `ORD-${suffix}`;
    };

    // Initial State
    const [formData, setFormData] = useState<Partial<IOrder>>(initialOrder || {
        order_id: generateOrderId(),
        customer: {
            customer_phone_number: '',
            customer_name: '',
            address: {
                street: '',
                ward: '',
                district: '',
                province: ''
            }
        },
        status: 'created',
        fulfillment_method: 'store_pickup',
        delivery_at: `${defaultDay}T${defaultTime}:00`,
        cake_orders: [],
        total_amount: 0,
        deposit_amount: 0,
        payment_method: 'cash',
        created_by: currentLoggedInUser || users[0] || null,
        received_by: users[0] || null,
        shipping_fee: 0,
        is_notified: false,
        order_note: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    });

    const [depositMethod, setDepositMethod] = useState<'cash' | 'transfer'>('cash');
    const [selectedReceivedBy, setSelectedReceivedBy] = useState<string>('');
    
    // Image zoom state
    const [zoomedImage, setZoomedImage] = useState<{ itemIndex: number; imageIndex: number } | null>(null);
    
    // Store File objects separately for each custom cake item
    // Key: `${itemIndex}-${imageIndex}`, Value: File object
    const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());

    // Format currency helper
    const formatCurrency = (value: number | string): string => {
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d]/g, '')) || 0 : value;
        return numValue.toLocaleString('vi-VN');
    };

    // Parse currency input (remove formatting)
    const parseCurrency = (value: string): number => {
        return parseFloat(value.replace(/[^\d]/g, '')) || 0;
    };

    // Province/District/Ward Selection State
    // Default to Đà Nẵng (code: 48)
    const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(() => {
        const daNang = PROVINCES.find(p => normalizeVi(p.name) === normalizeVi('Thành phố Đà Nẵng'));
        return daNang?.code || null;
    });
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);
    const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null);
    
    // Store previous province/district/ward values when switching to store_pickup
    const [savedProvinceCode, setSavedProvinceCode] = useState<number | null>(null);
    const [savedDistrictCode, setSavedDistrictCode] = useState<number | null>(null);
    const [savedWardCode, setSavedWardCode] = useState<number | null>(null);

    // Initialize province/district/ward from initialOrder if exists
    useEffect(() => {
        const daNang = PROVINCES.find(p => normalizeVi(p.name) === normalizeVi('Thành phố Đà Nẵng'));
        
        if (initialOrder?.customer.address) {
            const { district, ward, province: provinceName } = initialOrder.customer.address;
            let found = false;
            // Try to find matching province/district/ward from PROVINCES
            for (const province of PROVINCES) {
                for (const dist of province.districts) {
                    if (dist.name === district) {
                        setSelectedProvinceCode(province.code);
                        setSelectedDistrictCode(dist.code);
                        // Find ward
                        for (const w of dist.wards) {
                            if (w.name === ward) {
                                setSelectedWardCode(w.code);
                                break;
                            }
                        }
                        found = true;
                        
                        if (!provinceName || provinceName !== province.name) {
                            setFormData(prev => ({
                                ...prev,
                                customer: {
                                    ...prev.customer!,
                                    address: {
                                        ...prev.customer!.address!,
                                        province: province.name
                                    }
                                }
                            }));
                        }
                        return;
                    }
                }
            }
            // If not found, default to Đà Nẵng
            if (!found && daNang) {
                setSelectedProvinceCode(daNang.code);
                setSelectedDistrictCode(null);
                setSelectedWardCode(null);
                setFormData(prev => ({
                    ...prev,
                    customer: {
                        ...prev.customer!,
                        address: {
                            ...prev.customer!.address!,
                            province: daNang.name
                        }
                    }
                }));
            }
        }
        else {
            // Set default to Đà Nẵng when no initial order
            if (daNang) {
                setSelectedProvinceCode(daNang.code);
                setSelectedDistrictCode(null);
                setSelectedWardCode(null);
                setFormData(prev => ({
                    ...prev,
                    customer: {
                        ...prev.customer!,
                        address: {
                            ...prev.customer!.address!,
                            province: daNang.name
                        }
                    }
                }));
            }
        }
    }, [initialOrder]);


    // Handle phone number change with validation and customer lookup
    const handlePhoneChange = (phone: string) => {
        // Remove non-numeric characters
        const cleanedPhone = phone.replace(/\D/g, '');
        
        setFormData(prev => ({
            ...prev,
            customer: {
                ...prev.customer!,
                customer_phone_number: cleanedPhone
            }
        }));

        // Validate phone number length
        if (cleanedPhone.length > 0 && cleanedPhone.length < 10) {
            setPhoneError('Số điện thoại phải có 10 chữ số');
            setFoundCustomer(null);
            return;
        }

        if (cleanedPhone.length === 10) {
            setPhoneError('');
            // Search for customer
            const customer = customers.find(c => c.customer_phone_number === cleanedPhone);
            if (customer) {
                setFoundCustomer(customer);
                // Auto-fill customer info
                setFormData(prev => ({
                    ...prev,
                    customer: {
                        customer_phone_number: customer.customer_phone_number,
                        customer_name: customer.customer_name,
                        address: customer.address || {
                            street: '',
                            ward: '',
                            district: '',
                            province: ''
                        }
                    }
                }));
                
                // Auto-switch to "Giao đi" if customer has address
                if (customer.address && (customer.address.street || customer.address.district || customer.address.ward)) {
                    setFormData(prev => ({
                        ...prev,
                        fulfillment_method: 'home_delivery'
                    }));
                }
                
                // Set province/district/ward if address exists
                if (customer.address?.district) {
                    for (const province of PROVINCES) {
                        for (const dist of province.districts) {
                            if (dist.name === customer.address.district) {
                                setSelectedProvinceCode(province.code);
                                setSelectedDistrictCode(dist.code);
                                if (customer.address.ward) {
                                    const ward = dist.wards.find(w => w.name === customer.address.ward);
                                    if (ward) {
                                        setSelectedWardCode(ward.code);
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            } else {
                setFoundCustomer(null);
                // Keep phone number but allow manual entry of name and address
            }
        } else if (cleanedPhone.length > 10) {
            setPhoneError('Số điện thoại không hợp lệ');
            setFoundCustomer(null);
        } else {
            setPhoneError('');
            setFoundCustomer(null);
        }
    };

    // Sync delivery day and time with delivery_at
    useEffect(() => {
        const combinedDateTime = `${deliveryDay}T${deliveryTime}:00`;
        setFormData(prev => ({
            ...prev,
            delivery_at: combinedDateTime
        }));
    }, [deliveryDay, deliveryTime]);

    // Filtered districts and wards based on selection
    const availableDistricts = useMemo(() => {
        if (!selectedProvinceCode) return [];
        const province = PROVINCES.find(p => p.code === selectedProvinceCode);
        return province?.districts || [];
    }, [selectedProvinceCode]);

    const availableWards = useMemo(() => {
        if (!selectedDistrictCode || !selectedProvinceCode) return [];
        const province = PROVINCES.find(p => p.code === selectedProvinceCode);
        const district = province?.districts.find(d => d.code === selectedDistrictCode);
        return district?.wards || [];
    }, [selectedProvinceCode, selectedDistrictCode]);

    // Sync local state with initial order for deposit details (if editing)
    // useEffect(() => {
    //     if (initialOrder && initialOrder.paymentHistory && initialOrder.paymentHistory.length > 0) {
    //         // Very simple assumption: last payment logic or main logic. 
    //         // Since this is just a quick edit form, we might not deep link everything, 
    //         // but let's try to set defaults if they exist.
    //          if (initialOrder.paymentMethod) setDepositMethod(initialOrder.paymentMethod);
    //          if (initialOrder.paymentReceiver) setDepositReceiver(initialOrder.paymentReceiver);
    //     }
    // }, [initialOrder]);

    // Totals Calculation
    const itemsTotal = formData.cake_orders?.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0) || 0;
    const shipping = formData.shipping_fee || 0;
    const finalTotal = itemsTotal + shipping;
    const remaining = finalTotal - (formData.deposit_amount || 0);

    const handleAddItem = () => {
        const newItem: TCakeOrderItem = {
            cake_id: '',
            cake_name: '',
            unit_price: 0,
            quantity: 1,
            type: 'european',
            status: 'available'
        };
        setFormData(prev => ({
            ...prev,
            cake_orders: [...(prev.cake_orders || []), newItem]
        }));
    };

    const handleProductSelect = (index: number, productId: string) => {
        const newItems = [...(formData.cake_orders || [])];
        if (productId === 'custom') {
            // TCustomCakeOrderItem - Bánh đặt riêng
            newItems[index] = {
                ...newItems[index],
                cake_id: 'custom',
                cake_name: 'Bánh kem',
                unit_price: 0,
                type: 'cream_cake',
                note: '',
                image_upload: [],
                status: 'available'
            } as TCustomCakeOrderItem;
        }
        else {
            // TAvailableCakeOrderItem - Bánh có sẵn
            const product = cakes.find(p => p.cake_id === productId);
            if (product) {
                // Remove note and image_upload if they exist (for type safety)
                const { note, image_upload, ...rest } = newItems[index] as any;
                newItems[index] = {
                    ...rest,
                    cake_id: product.cake_id,
                    cake_name: product.cake_name,
                    unit_price: product.unit_price,
                    type: product.type,
                    quantity: newItems[index].quantity || 1
                } as TAvailableCakeOrderItem;
            }
        }
        setFormData({ ...formData, cake_orders: newItems });
    };

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...(formData.cake_orders || [])];
        const currentItem = newItems[index];
        
        // If updating note or image_upload, only allow for custom items
        if ((field === 'note' || field === 'image_upload') && currentItem.cake_id !== 'custom') {
            return;
        }
        
        // Update the item
        if (currentItem.cake_id === 'custom') {
            // For custom items, allow note and image_upload
            const customItem = currentItem as TCustomCakeOrderItem;
            newItems[index] = { ...customItem, [field]: value } as TCustomCakeOrderItem;
        } else {
            // For available items, don't include note or image_upload
            const availableItem = currentItem as TAvailableCakeOrderItem;
            if (field === 'note' || field === 'image_upload') {
                return; // Don't allow these fields for available items
            }
            newItems[index] = { ...availableItem, [field]: value } as TAvailableCakeOrderItem;
        }
        
        setFormData({ ...formData, cake_orders: newItems });
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...(formData.cake_orders || [])];
        newItems.splice(index, 1);
        setFormData({ ...formData, cake_orders: newItems });
    };

    const handleImageUpload = (index: number, files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        const fileArray = Array.from(files);
        // Tạo blob URLs để preview
        const blobUrls = fileArray.map(file => URL.createObjectURL(file));
        
        // Lưu File objects vào Map để sau này convert sang base64 khi save
        const newImageFiles = new Map(imageFiles);
        fileArray.forEach((file, fileIndex) => {
            const currentItem = formData.cake_orders?.[index] as TCustomCakeOrderItem;
            const currentImageCount = currentItem?.image_upload?.length || 0;
            const key = `${index}-${currentImageCount + fileIndex}`;
            newImageFiles.set(key, file);
        });
        setImageFiles(newImageFiles);
        
        setFormData(prev => {
            const items = [...(prev.cake_orders || [])];
            const currentItem = items[index] as TCustomCakeOrderItem;
            items[index] = { 
                ...currentItem, 
                image_upload: [...(currentItem.image_upload || []), ...blobUrls] 
            };
            return { ...prev, cake_orders: items };
        });
    };
    
    const handleRemoveImage = (itemIndex: number, imageIndex: number) => {
        setFormData(prev => {
            const items = [...(prev.cake_orders || [])];
            const currentItem = items[itemIndex] as TCustomCakeOrderItem;
            const updatedImages = [...(currentItem.image_upload || [])];
            const removedUrl = updatedImages[imageIndex];
            
            // Revoke blob URL để giải phóng memory
            if (removedUrl && removedUrl.startsWith('blob:')) {
                URL.revokeObjectURL(removedUrl);
            }
            
            // Xóa File object khỏi Map
            const key = `${itemIndex}-${imageIndex}`;
            const newImageFiles = new Map(imageFiles);
            newImageFiles.delete(key);
            // Cập nhật lại keys cho các ảnh sau đó
            const updatedImageFiles = new Map<string, File>();
            newImageFiles.forEach((file, oldKey) => {
                const [oldItemIdx, oldImgIdx] = oldKey.split('-').map(Number);
                if (oldItemIdx === itemIndex && oldImgIdx > imageIndex) {
                    updatedImageFiles.set(`${oldItemIdx}-${oldImgIdx - 1}`, file);
                } else {
                    updatedImageFiles.set(oldKey, file);
                }
            });
            setImageFiles(updatedImageFiles);
            
            updatedImages.splice(imageIndex, 1);
            items[itemIndex] = { ...currentItem, image_upload: updatedImages };
            return { ...prev, cake_orders: items };
        });
    }

    // Image zoom handlers
    const openImageZoom = (itemIndex: number, imageIndex: number) => {
        setZoomedImage({ itemIndex, imageIndex });
    };

    const closeImageZoom = () => {
        setZoomedImage(null);
    };

    const handleNavigateImage = (newIndex: number) => {
        if (!zoomedImage) return;
        setZoomedImage({ ...zoomedImage, imageIndex: newIndex });
    };

    // Handle received_by change
    useEffect(() => {
        if (selectedReceivedBy) {
            const user = users.find(u => u.user_id === selectedReceivedBy);
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    received_by: user
                }));
            }
        }
    }, [selectedReceivedBy, users]);

    // Convert File objects thành base64 khi save
    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSaveAction = async (status: TOrderStatus) => {
        // Validate phone number
        if (formData.customer?.customer_phone_number && formData.customer.customer_phone_number.length !== 10) {
            setPhoneError('Số điện thoại phải có 10 chữ số');
            return;
        }

        if (status !== 'draft' && (formData.deposit_amount || 0) === 0) {
            if (!confirm("Tiền cọc đang là 0đ. Bạn có chắc chắn muốn tạo đơn không?")) {
                return;
            }
        }

        // Combine delivery day and time
        const delivery_at = `${deliveryDay}T${deliveryTime}:00`;

        // Convert File objects thành base64 cho các custom cake images
        const processedCakeOrders = await Promise.all(
            (formData.cake_orders || []).map(async (item, itemIndex) => {
                if (item.cake_id === 'custom' && 'image_upload' in item && Array.isArray(item.image_upload)) {
                    const convertedImages = await Promise.all(
                        item.image_upload.map(async (imgUrl, imgIndex) => {
                            // Nếu đã là base64 hoặc URL thực sự, giữ nguyên
                            if (imgUrl.startsWith('data:') || (!imgUrl.startsWith('blob:') && imgUrl.startsWith('http'))) {
                                return imgUrl;
                            }
                            
                            // Nếu là blob URL, lấy File object từ Map và convert
                            const key = `${itemIndex}-${imgIndex}`;
                            const file = imageFiles.get(key);
                            if (file) {
                                return await convertFileToBase64(file);
                            }
                            
                            // Fallback: convert từ blob URL
                            try {
                                const response = await fetch(imgUrl);
                                const blob = await response.blob();
                                return await convertFileToBase64(new File([blob], 'image.jpg'));
                            } catch (error) {
                                console.error('Failed to convert blob to base64:', error);
                                return imgUrl;
                            }
                        })
                    );
                    return {
                        ...item,
                        image_upload: convertedImages
                    };
                }
                return item;
            })
        );

        // Attach payment info to order
        const orderToSave: IOrder = {
            ...formData as IOrder,
            cake_orders: processedCakeOrders,
            status: status,
            payment_method: 'cash',
            total_amount: finalTotal,
            order_note: formData.order_note || '',
            delivery_at: delivery_at
        };
        console.log(orderToSave);
        onSave(orderToSave);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                 {/* Header */}
                 <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{initialOrder ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                 </div>
                 
                 {/* Body */}
                 <div className="flex-1 overflow-y-auto bg-slate-50 p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                        
                        {/* LEFT COLUMN: INFO (Customer & Delivery) - Span 5 */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Customer Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <User size={16} className="text-[#B1454A]"/> Thông tin khách hàng
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Số điện thoại *</label>
                                        <input 
                                            className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#B1454A]/20 outline-none transition-all ${
                                                phoneError ? 'border-red-500' : foundCustomer ? 'border-green-500' : 'border-slate-200'
                                            }`}
                                            placeholder="Nhập số điện thoại..."
                                            value={formData.customer.customer_phone_number}
                                            onChange={e => handlePhoneChange(e.target.value)}
                                            maxLength={10}
                                        />
                                        {phoneError && (
                                            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                                        )}
                                        {foundCustomer && !phoneError && (
                                            <p className="text-xs text-green-600 mt-1">✓ Đã tìm thấy khách hàng</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tên khách hàng *</label>
                                        <input 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#B1454A]/20 outline-none transition-all"
                                            placeholder="Nhập tên khách..."
                                            value={formData.customer.customer_name}
                                            onChange={e => setFormData({...formData, customer: {...formData.customer!, customer_name: e.target.value}})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Section */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                                    <Truck size={16} className="text-[#B1454A]"/> Thông tin giao nhận
                                </h3>
                                <div className="space-y-5">
                                    {/* Method Toggle */}
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button 
                                            onClick={() => {
                                                // Save current province/district/ward values before resetting
                                                if (formData.fulfillment_method === 'home_delivery') {
                                                    setSavedProvinceCode(selectedProvinceCode);
                                                    setSavedDistrictCode(selectedDistrictCode);
                                                    setSavedWardCode(selectedWardCode);
                                                }
                                                setFormData({...formData, fulfillment_method: 'store_pickup'});
                                                // Reset address selection when switching to store pickup
                                                setSelectedProvinceCode(null);
                                                setSelectedDistrictCode(null);
                                                setSelectedWardCode(null);
                                            }}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.fulfillment_method === 'store_pickup' ? 'bg-white text-[#B1454A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Store size={14}/> Tại quầy
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setFormData({...formData, fulfillment_method: 'home_delivery'});
                                                // Restore saved province/district/ward values if they exist
                                                if (savedProvinceCode !== null) {
                                                    setSelectedProvinceCode(savedProvinceCode);
                                                    setSelectedDistrictCode(savedDistrictCode);
                                                    setSelectedWardCode(savedWardCode);
                                                    
                                                    // Restore province name vào formData
                                                    const savedProvince = PROVINCES.find(p => p.code === savedProvinceCode);
                                                    const savedDistrict = savedProvince?.districts.find(d => d.code === savedDistrictCode);
                                                    const savedWard = savedDistrict?.wards.find(w => w.code === savedWardCode);
                                                    
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        customer: {
                                                            ...prev.customer!,
                                                            address: {
                                                                ...prev.customer!.address!,
                                                                province: savedProvince?.name || '',
                                                                district: savedDistrict?.name || '',
                                                                ward: savedWard?.name || ''
                                                            }
                                                        }
                                                    }));
                                                    
                                                    // Clear saved values after restoring
                                                    setSavedProvinceCode(null);
                                                    setSavedDistrictCode(null);
                                                    setSavedWardCode(null);
                                                }
                                                else if (selectedProvinceCode === null) {
                                                    // Only set default if no value was previously selected and no saved value
                                                    const daNang = PROVINCES.find(p => normalizeVi(p.name) === normalizeVi('Thành phố Đà Nẵng'));
                                                    if (daNang) {
                                                        setSelectedProvinceCode(daNang.code);
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            customer: {
                                                                ...prev.customer!,
                                                                address: {
                                                                    ...prev.customer!.address!,
                                                                    province: daNang.name
                                                                }
                                                            }
                                                        }));
                                                    }
                                                }
                                            }}
                                            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${formData.fulfillment_method === 'home_delivery' ? 'bg-white text-[#B1454A] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            <Truck size={14}/> Giao đi
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Ngày giao</label>
                                            <input 
                                                type="date"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                                value={deliveryDay}
                                                onChange={e => setDeliveryDay(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Giờ giao</label>
                                            <input 
                                                type="time"
                                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none"
                                                value={deliveryTime}
                                                onChange={e => setDeliveryTime(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {formData.fulfillment_method === 'home_delivery' && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Địa chỉ giao hàng</label>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-1 gap-2">
                                                    {/* Province Select */}
                                                    <select
                                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#B1454A]/20"
                                                        value={selectedProvinceCode || ''}
                                                        onChange={(e) => {
                                                            const code = e.target.value ? Number(e.target.value) : null;
                                                            setSelectedProvinceCode(code);
                                                            setSelectedDistrictCode(null);
                                                            setSelectedWardCode(null);
                                                            const province = code ? PROVINCES.find(p => p.code === code) : null;
                                                            
                                                            setFormData({
                                                                ...formData, 
                                                                customer: {
                                                                    ...formData.customer!, 
                                                                    address: {
                                                                        ...formData.customer!.address!,
                                                                        district: '',
                                                                        province: province?.name || '',
                                                                        ward: ''
                                                                    }
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                                        {PROVINCES.map(province => (
                                                            <option key={province.code} value={province.code}>
                                                                {province.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    
                                                    <div className='grid grid-cols-2 gap-2'>
                                                        {/* District Select */}
                                                        <select
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#B1454A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            value={selectedDistrictCode || ''}
                                                            onChange={(e) => {
                                                                const code = e.target.value ? Number(e.target.value) : null;
                                                                setSelectedDistrictCode(code);
                                                                setSelectedWardCode(null);
                                                                const district = code ? availableDistricts.find(d => d.code === code) : null;
                                                                const province = selectedProvinceCode ? PROVINCES.find(p => p.code === selectedProvinceCode) : null;
                                                                setFormData({
                                                                    ...formData, 
                                                                    customer: {
                                                                        ...formData.customer!, 
                                                                        address: {
                                                                            ...formData.customer!.address!,
                                                                            district: district?.name || '',
                                                                            province: province?.name || '',
                                                                            ward: ''
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            disabled={!selectedProvinceCode}
                                                        >
                                                            <option value="">-- Chọn Quận/Huyện --</option>
                                                            {availableDistricts.map(district => (
                                                                <option key={district.code} value={district.code}>
                                                                    {district.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        
                                                        {/* Ward Select */}
                                                        <select
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#B1454A]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            value={selectedWardCode || ''}
                                                            onChange={(e) => {
                                                                const code = e.target.value ? Number(e.target.value) : null;
                                                                setSelectedWardCode(code);
                                                                const ward = code ? availableWards.find(w => w.code === code) : null;
                                                                const province = selectedProvinceCode ? PROVINCES.find(p => p.code === selectedProvinceCode) : null;
                                                                setFormData({
                                                                    ...formData, 
                                                                    customer: {
                                                                        ...formData.customer!, 
                                                                        address: {
                                                                            ...formData.customer!.address!,
                                                                            province: province?.name || '',
                                                                            ward: ward?.name || ''
                                                                        }
                                                                    }
                                                                });
                                                            }}
                                                            disabled={!selectedDistrictCode}
                                                        >
                                                            <option value="">-- Chọn Phường/Xã --</option>
                                                            {availableWards.map(ward => (
                                                                <option key={ward.code} value={ward.code}>
                                                                    {ward.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>

                                                <input 
                                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                                                    placeholder="Số nhà, tên đường..."
                                                    value={formData.customer.address?.street || ''}
                                                    onChange={e => setFormData({...formData, customer: {...formData.customer!, address: {...formData.customer!.address!, street: e.target.value}}})}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                         <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Ghi chú đơn hàng</label>
                                         <textarea 
                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none h-20"
                                            placeholder="Ghi chú thêm..."
                                            value={formData.order_note || ''}
                                            onChange={e => setFormData({...formData, order_note: e.target.value})}
                                         />
                                    </div>

                                    {/* Status Update - Only show when editing order with status 'created' */}
                                    {initialOrder && initialOrder.status === 'created' && (
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Cập nhật trạng thái</label>
                                            <select 
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#B1454A]/20"
                                                value={formData.status || 'created'}
                                                onChange={e => setFormData({...formData, status: e.target.value as TOrderStatus})}
                                            >
                                                <option value="created">{orderStatusLabels.created}</option>
                                                <option value="in_production">{orderStatusLabels.in_production}</option>
                                                <option value="ready">{orderStatusLabels.ready}</option>
                                            </select>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="is_notified"
                                            checked={formData.is_notified || false}
                                            onChange={e => setFormData({...formData, is_notified: e.target.checked})}
                                            className="w-4 h-4 text-[#B1454A] border-slate-300 rounded focus:ring-[#B1454A] cursor-pointer"
                                        />
                                        <label htmlFor="is_notified" className="text-sm font-medium text-slate-700 cursor-pointer">
                                            Yêu cầu chụp ảnh
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: PRODUCTS (Cart) - Span 7 */}
                        <div className="lg:col-span-7 flex flex-col h-full gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col flex-1 overflow-hidden">
                                 {/* Header */}
                                 <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                     <h3 className="font-bold text-slate-700 flex items-center gap-2"><ShoppingCart size={18}/> Danh sách sản phẩm</h3>
                                     <button 
                                        onClick={handleAddItem}
                                        className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold text-xs shadow-lg hover:bg-slate-700 flex items-center gap-2 whitespace-nowrap"
                                     >
                                        <Plus size={14}/> Thêm sản phẩm
                                     </button>
                                 </div>

                                 {/* Items List (Table Format) */}
                                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                                     {formData.cake_orders?.length === 0 ? (
                                         <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 p-8">
                                             <ShoppingCart size={40} className="opacity-20"/>
                                             <p className="text-sm font-medium">Chưa có sản phẩm nào</p>
                                         </div>
                                     ) : (
                                        <table className="w-full">
                                            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase sticky top-0 z-10">
                                                <tr>
                                                    <th className="px-4 py-3 text-left">Sản phẩm</th>
                                                    <th className="px-2 py-3 text-right w-24">Đơn giá</th>
                                                    <th className="px-2 py-3 text-center w-28">Số lượng</th>
                                                    <th className="px-2 py-3 text-right w-28">Thành tiền</th>
                                                    <th className="px-2 py-3 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {formData.cake_orders?.map((item, idx) => (
                                                    <tr key={idx} className={`relative hover:bg-slate-50/50 transition-colors ${item.cake_id === 'custom' ? 'bg-red-50/30' : ''}`}>
                                                        {/* Product Info Column */}
                                                        <td className="px-4 py-3 align-top w-[40%]">
                                                            <div className="flex flex-col gap-2">
                                                                {/* Product Select */}
                                                                <select 
                                                                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-[#B1454A]"
                                                                    value={item.cake_id || ''}
                                                                    onChange={(e) => handleProductSelect(idx, e.target.value)}
                                                                >
                                                                    <option value="" disabled>-- Chọn sản phẩm --</option>
                                                                    <option value="custom" className="font-bold text-[#B1454A]">+ Bánh đặt riêng</option>
                                                                    <optgroup label="Sản phẩm có sẵn">
                                                                        {cakes.map(p => (
                                                                            <option key={p.cake_id} value={p.cake_id}>{p.cake_name}</option>
                                                                        ))}
                                                                    </optgroup>
                                                                </select>

                                                                {/* Extra Details - Only show for custom items */}
                                                                {item.cake_id === 'custom' && (
                                                                    <div className="flex gap-3 mt-2">
                                                                        {/* Thumbnail */}
                                                                        {/* <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden relative group">
                                                                            <img 
                                                                                src={'image_upload' in item && item.image_upload ? item.image_upload : "https://placehold.co/50"} 
                                                                                alt="" 
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div> */}

                                                                        {/* Custom Fields */}
                                                                        <div className="flex-1 min-w-0 space-y-2">
                                                                            <input 
                                                                                className="w-full font-bold text-slate-800 text-sm bg-transparent border-b border-dashed border-slate-300 hover:border-[#B1454A] focus:border-[#B1454A] outline-none py-0.5 placeholder:font-normal"
                                                                                value={item.cake_name}
                                                                                onChange={e => handleUpdateItem(idx, 'cake_name', e.target.value)}
                                                                                placeholder="Tên bánh đặt riêng..."
                                                                            />
                                                                            <textarea 
                                                                                className="absolute top-[40%] right-4 w-[55%] text-sm bg-white border border-slate-200 rounded p-1.5 placeholder:text-slate-400 text-slate-700 outline-none focus:border-[#B1454A] resize-none h-16"
                                                                                placeholder="Mô tả chi tiết (size, cốt bánh, trang trí...)"
                                                                                value={item.cake_id === 'custom' && 'note' in item ? item.note : ''}
                                                                                onChange={e => {
                                                                                    if (item.cake_id === 'custom') {
                                                                                        handleUpdateItem(idx, 'note' as any, e.target.value);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {/* Mini Image Upload for Custom */}
                                                                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                                                                <label className="w-8 h-8 shrink-0 border border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 cursor-pointer hover:border-[#B1454A] hover:text-[#B1454A] transition-colors bg-white">
                                                                                    <Plus size={12}/>
                                                                                    <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(idx, e.target.files)} />
                                                                                </label>
                                                                                {'image_upload' in item && Array.isArray(item.image_upload) && item.image_upload.map((imageUrl, imgIdx) => (
                                                                                    <div key={imgIdx} className="w-8 h-8 shrink-0 relative rounded overflow-hidden group/img border border-slate-200">
                                                                                        <img 
                                                                                            src={imageUrl} 
                                                                                            alt={`Ảnh ${imgIdx + 1}`} 
                                                                                            className="w-full h-full object-cover cursor-pointer"
                                                                                            onClick={() => openImageZoom(idx, imgIdx)}
                                                                                            loading="lazy"
                                                                                        />
                                                                                        <button 
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                handleRemoveImage(idx, imgIdx);
                                                                                            }}
                                                                                            className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity rounded-bl rounded-tr"
                                                                                        >
                                                                                            <X size={8}/>
                                                                                        </button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Price Column */}
                                                        <td className="px-2 py-3 align-top text-right">
                                                            <input 
                                                                type="number"
                                                                className="w-full text-right bg-transparent text-sm font-medium text-slate-700 outline-none border-b border-transparent hover:border-slate-300 focus:border-[#B1454A] p-1"
                                                                value={item.unit_price}
                                                                onChange={e => handleUpdateItem(idx, 'unit_price', Number(e.target.value))}
                                                                disabled={item.type === 'european'} // Only edit price for custom
                                                            />
                                                        </td>

                                                        {/* Quantity Column */}
                                                        <td className="px-2 py-3 align-top">
                                                            <div className="flex items-center justify-center border border-slate-200 rounded-lg bg-white h-8 w-24 mx-auto">
                                                                <button 
                                                                    onClick={() => handleUpdateItem(idx, 'quantity', Math.max(1, item.quantity - 1))}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-500"
                                                                ><Minus size={12}/></button>
                                                                <span className="flex-1 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                                                                <button 
                                                                    onClick={() => handleUpdateItem(idx, 'quantity', item.quantity + 1)}
                                                                    className="w-8 h-full flex items-center justify-center hover:bg-slate-50 text-slate-500"
                                                                ><Plus size={12}/></button>
                                                            </div>
                                                        </td>

                                                        {/* Total Column */}
                                                        <td className="px-2 py-3 align-top text-right">
                                                            <span className="text-sm font-bold text-slate-900 block py-1">
                                                                {(item.unit_price * item.quantity).toLocaleString()}
                                                            </span>
                                                        </td>

                                                        {/* Delete Column */}
                                                        <td className="px-2 py-3 align-top text-center">
                                                            <button 
                                                                onClick={() => handleRemoveItem(idx)}
                                                                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            >
                                                                <Trash2 size={16}/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                     )}
                                 </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Tạm tính:</span>
                                    <span className="font-bold text-slate-800">{itemsTotal.toLocaleString()} đ</span>
                                </div>
                                {formData.fulfillment_method === 'home_delivery' && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500 font-medium">Phí giao hàng:</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="text"
                                                className="w-32 text-right bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none focus:border-[#B1454A] focus:ring-2 focus:ring-[#B1454A]/20"
                                                placeholder="0"
                                                value={formatCurrency(formData.shipping_fee || 0)}
                                                onChange={e => {
                                                    const value = parseCurrency(e.target.value);
                                                    setFormData({...formData, shipping_fee: value});
                                                }}
                                                onBlur={e => {
                                                    const value = parseCurrency(e.target.value);
                                                    setFormData({...formData, shipping_fee: value});
                                                }}
                                            />
                                            <span className="text-slate-400 text-xs">đ</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 font-medium">Đã đặt cọc:</span>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text"
                                            className="w-32 text-right bg-slate-50 rounded-lg border border-green-200 px-3 py-2 text-sm font-bold text-green-600 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                            placeholder="0"
                                            value={formatCurrency(formData.deposit_amount || 0)}
                                            onChange={e => {
                                                const value = parseCurrency(e.target.value);
                                                setFormData({...formData, deposit_amount: value});
                                            }}
                                            onBlur={e => {
                                                const value = parseCurrency(e.target.value);
                                                setFormData({...formData, deposit_amount: value});
                                            }}
                                        />
                                        <span className="text-slate-400 text-xs">đ</span>
                                    </div>
                                </div>

                                {/* NEW: Deposit Details */}
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Hình thức cọc</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                            value={depositMethod}
                                            onChange={(e) => setDepositMethod(e.target.value as any)}
                                        >
                                            <option value="cash">Tiền mặt</option>
                                            <option value="transfer">Chuyển khoản</option>
                                        </select>
                                     </div>
                                     <div>
                                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Nhân viên nhận</label>
                                        <select 
                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                                            value={selectedReceivedBy}
                                            onChange={(e) => setSelectedReceivedBy(e.target.value)}
                                            disabled={isLoadingAppData}
                                        >
                                            {isLoadingAppData ? (
                                                <option>Đang tải...</option>
                                            ) : users.length === 0 ? (
                                                <option>Chưa có dữ liệu</option>
                                            ) : (
                                                users.map(user => (
                                                    <option key={user.user_id} value={user.user_id}>
                                                        {user.username}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                     </div>
                                </div>

                                <div className="border-t border-dashed border-slate-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 uppercase text-xs tracking-wide">Tổng cộng</span>
                                    <span className="font-black text-xl text-[#B1454A]">{finalTotal.toLocaleString()} đ</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-slate-800 uppercase text-xs tracking-wide">Cần thu (COD)</span>
                                    <span className="font-black text-xl text-slate-800">{remaining.toLocaleString()} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Footer */}
                 <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 z-10">
                    {/* <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">Hủy bỏ</button>
                     
                    {!initialOrder && (
                        <button 
                            onClick={() => handleSaveAction('draft')} 
                            className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                        >
                            <FilePlus size={18}/> Lưu nháp
                        </button>
                    )}
                     
                    <button 
                        disabled={loading}
                        onClick={() => handleSaveAction('created')} 
                        className="px-8 py-3 rounded-xl font-bold text-white bg-[#B1454A] hover:bg-[#8e373b] shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2"
                    >
                        {loading 
                            ? <Spinner label="Đang lưu đơn hàng ..." /> 
                            : <><Save size={18}/> {initialOrder ? 'Cập nhật' : 'Tạo đơn'}</>
                        }
                    </button> */}

                    {loading ? (
                        <button 
                            disabled={true}
                            className="px-8 py-3 rounded-xl font-bold text-white bg-[#B1454A] hover:bg-[#8e373b] shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Spinner label="Đang lưu đơn hàng ..." />
                        </button>
                    ) : (<>
                        <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">Hủy bỏ</button>
                        
                        {!initialOrder && (
                            <button 
                                onClick={() => handleSaveAction('draft')} 
                                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2"
                            >
                                <FilePlus size={18}/> Lưu nháp
                            </button>
                        )}
                        
                        <button 
                            onClick={() => handleSaveAction(formData.status || 'created')} 
                            className="px-8 py-3 rounded-xl font-bold text-white bg-[#B1454A] hover:bg-[#8e373b] shadow-lg shadow-red-100 transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Save size={18}/> {initialOrder ? 'Cập nhật' : 'Tạo đơn'}
                        </button>
                    </>)}
                 </div>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (() => {
                const { itemIndex, imageIndex } = zoomedImage;
                const currentItem = formData.cake_orders?.[itemIndex] as TCustomCakeOrderItem;
                if (!currentItem || !Array.isArray(currentItem.image_upload) || currentItem.image_upload.length === 0) return null;
                
                return (
                    <ImageZoomModal
                        images={currentItem.image_upload}
                        currentIndex={imageIndex}
                        onClose={closeImageZoom}
                        onNavigate={handleNavigateImage}
                    />
                );
            })()}
        </div>
    )
}
 
export default OrderFormModal;