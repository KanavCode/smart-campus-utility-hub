import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormModal } from '@/components/modals/FormModal';
import { UserForm } from '@/components/forms/UserForm';
import { userService } from '@/services/userService';
import { useAdminCrud } from '@/hooks/useAdminCrud';

interface User {
  id: string;
  full_name?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  cgpa?: number;
  semester?: number;
}

export default function Users() {
  const [search, setSearch] = useState('');
  const {
    items: users,
    isModalOpen,
    selectedItem: selectedUser,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
  } = useAdminCrud<User>({
    getAll: userService.getAll,
    deleteById: userService.delete,
    entityName: 'user',
  });

  const filteredUsers = users.filter((user) => {
    const q = search.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage students and staff accounts</p>
          </div>
          <Button
            onClick={openCreate}
            className="bg-primary text-primary-foreground font-semibold glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </motion.button>
          </Button>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-accent/5">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No users found. Create your first user to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/5">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-accent/20 text-xs">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem onClick={() => openEdit(user)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteItem(user.id)}
                              className="text-destructive"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={selectedUser ? 'Edit User' : 'Create New User'}
        >
          <UserForm
            onSuccess={handleFormSuccess}
            onCancel={closeModal}
            initialData={selectedUser}
          />
        </FormModal>
      </motion.div>
    </DashboardLayout>
  );
}
