import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

interface ConfirmationState extends ConfirmationOptions {
  open: boolean;
  onConfirm: (() => void) | null;
}

export function useConfirmation() {
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    open: false,
    title: '',
    description: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    variant: 'info',
    onConfirm: null,
  });

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmation({
        ...options,
        open: true,
        onConfirm: () => {
          resolve(true);
          setConfirmation(prev => ({ ...prev, open: false, onConfirm: null }));
        },
      });
    });
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmation(prev => ({ ...prev, open: false, onConfirm: null }));
  }, []);

  return {
    confirmation,
    confirm,
    handleCancel,
  };
}
