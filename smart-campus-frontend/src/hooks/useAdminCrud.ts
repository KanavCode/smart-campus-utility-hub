import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface UseAdminCrudOptions<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  deleteById: (id: string) => Promise<void>;
  entityName: string;
  confirmDeleteMessage?: string;
  onLoadErrorMessage?: string;
  onDeleteErrorMessage?: string;
  onDeleteSuccessMessage?: string;
  autoLoad?: boolean;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export function useAdminCrud<T extends { id: string }>({
  getAll,
  deleteById,
  entityName,
  confirmDeleteMessage,
  onLoadErrorMessage,
  onDeleteErrorMessage,
  onDeleteSuccessMessage,
  autoLoad = true,
}: UseAdminCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const entityNameTitle = capitalize(entityName);

  const loadItems = useCallback(async () => {
    try {
      const data = await getAll();
      setItems(data);
    } catch (error: any) {
      toast.error(onLoadErrorMessage || error?.message || `Failed to load ${entityName}s`);
      setItems([]);
    }
  }, [entityName, getAll, onLoadErrorMessage]);

  useEffect(() => {
    if (autoLoad) {
      loadItems();
    }
  }, [autoLoad, loadItems]);

  const openCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: T) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const deleteItem = async (id: string) => {
    if (confirmDeleteMessage && !window.confirm(confirmDeleteMessage)) {
      return;
    }

    try {
      await deleteById(id);
      toast.success(onDeleteSuccessMessage || `${entityNameTitle} deleted successfully`);
      loadItems();
    } catch (error: any) {
      toast.error(onDeleteErrorMessage || error?.message || `Failed to delete ${entityName}`);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    loadItems();
  };

  return {
    items,
    setItems,
    isModalOpen,
    selectedItem,
    loadItems,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
  };
}
