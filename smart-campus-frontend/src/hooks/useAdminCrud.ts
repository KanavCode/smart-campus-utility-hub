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

interface UseAdminCrudReturn<T extends { id: string }> {
  items: T[];
  setItems: (items: T[]) => void;
  isModalOpen: boolean;
  selectedItem: T | null;
  isLoading: boolean;
  isDeleting: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  openCreate: () => void;
  openEdit: (item: T) => void;
  closeModal: () => void;
  deleteItem: (id: string) => Promise<void>;
  handleFormSuccess: () => void;
  clearError: () => void;
  retryLoad: () => Promise<void>;
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Reusable hook for admin CRUD operations with loading and error states
 * Manages items, modals, loading/error states, and provides toast notifications
 */
export function useAdminCrud<T extends { id: string }>({
  getAll,
  deleteById,
  entityName,
  confirmDeleteMessage,
  onLoadErrorMessage,
  onDeleteErrorMessage,
  onDeleteSuccessMessage,
  autoLoad = true,
}: UseAdminCrudOptions<T>): UseAdminCrudReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entityNameTitle = capitalize(entityName);

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAll();
      setItems(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = onLoadErrorMessage || err?.message || `Failed to load ${entityName}s`;
      setError(errorMessage);
      toast.error(errorMessage);
      // Keep items instead of clearing - maintain state on error
    } finally {
      setIsLoading(false);
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

    setIsDeleting(true);
    try {
      await deleteById(id);
      toast.success(onDeleteSuccessMessage || `${entityNameTitle} deleted successfully`);
      setError(null);
      await loadItems();
    } catch (err: any) {
      const errorMessage = onDeleteErrorMessage || err?.message || `Failed to delete ${entityName}`;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsModalOpen(false);
    setError(null);
    loadItems();
  };

  const clearError = () => {
    setError(null);
  };

  const retryLoad = async () => {
    await loadItems();
  };

  return {
    items,
    setItems,
    isModalOpen,
    selectedItem,
    isLoading,
    isDeleting,
    error,
    loadItems,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
    clearError,
    retryLoad,
  };
}
