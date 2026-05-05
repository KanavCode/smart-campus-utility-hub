import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, MoreVertical, Download, X } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormModal } from '@/components/modals/FormModal';
import { UserForm } from '@/components/forms/UserForm';
import { TableDataStateRenderer, SkeletonTableRow } from '@/components/ui/DataStateDisplay';
import { userService, UserFilterParams } from '@/services/userService';
import { useAdminCrud } from '@/hooks/useAdminCrud';
import { downloadUsersAsCSV, generateTimestampedFilename } from '@/lib/csvExport';

interface User {
  id: string;
  full_name?: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  cgpa?: number;
  semester?: number;
  is_active?: boolean;
  created_at?: string;
}

interface FilterState {
  search: string;
  role: string;
  department: string;
  is_active: string;
}

export default function Users() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: '',
    department: '',
    is_active: '',
  });

  const [isLoadingFiltered, setIsLoadingFiltered] = useState(false);
  const [filteredUsersData, setFilteredUsersData] = useState<User[]>([]);

  const {
    items: users,
    isModalOpen,
    selectedItem: selectedUser,
    isLoading,
    error,
    openCreate,
    openEdit,
    closeModal,
    deleteItem,
    handleFormSuccess,
    retryLoad,
  } = useAdminCrud<User>({
    getAll: userService.getAll,
    deleteById: userService.delete,
    entityName: 'user',
  });

  // Fetch filtered users when filters change
  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (filters.role || filters.department || filters.is_active) {
        setIsLoadingFiltered(true);
        try {
          const filterParams: UserFilterParams = {};
          if (filters.role) filterParams.role = filters.role;
          if (filters.department) filterParams.department = filters.department;
          if (filters.is_active === 'true') {
            filterParams.is_active = true;
          } else if (filters.is_active === 'false') {
            filterParams.is_active = false;
          }

          const data = await userService.getAllWithFilters(filterParams);
          setFilteredUsersData(data);
        } catch (err) {
          console.error('Error fetching filtered users:', err);
          setFilteredUsersData([]);
        } finally {
          setIsLoadingFiltered(false);
        }
      } else {
        setFilteredUsersData([]);
      }
    };

    fetchFilteredUsers();
  }, [filters.role, filters.department, filters.is_active]);

  // Determine which data to display
  const dataToDisplay =
    filters.role || filters.department || filters.is_active ? filteredUsersData : users;

  // Apply search filter on top of other filters
  const searchFiltered = dataToDisplay.filter((user) => {
    const q = filters.search.toLowerCase();
    return (
      (user.name || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.role || '').toLowerCase().includes(q)
    );
  });

  // Unique values for filter dropdowns
  const uniqueRoles = Array.from(new Set(users.map((u) => u.role).filter(Boolean)));
  const uniqueDepartments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  );

  const handleFilterChange = (filterKey: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      role: '',
      department: '',
      is_active: '',
    });
  };

  const handleDownloadCSV = () => {
    const filename = generateTimestampedFilename();
    downloadUsersAsCSV(searchFiltered, filename);
  };

  const hasActiveFilters = filters.role || filters.department || filters.is_active || filters.search;

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
          {/* Search and Filter Bar */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleDownloadCSV}
                disabled={searchFiltered.length === 0}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download CSV</span>
              </Button>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={filters.role} onValueChange={(value) => handleFilterChange('role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Roles</SelectItem>
                  {uniqueRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.department}
                onValueChange={(value) => handleFilterChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Departments</SelectItem>
                  {uniqueDepartments.map((dept) => (
                    <SelectItem key={dept} value={dept || ''}>
                      {dept || 'No Department'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.is_active}
                onValueChange={(value) => handleFilterChange('is_active', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="text-sm text-muted-foreground">
                Showing {searchFiltered.length} of {users.length} users
                {filters.role && ` • Role: ${filters.role}`}
                {filters.department && ` • Department: ${filters.department}`}
                {filters.is_active && ` • Status: ${filters.is_active === 'true' ? 'Active' : 'Inactive'}`}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-accent/5">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Loading state */}
                {(isLoading || isLoadingFiltered) && (
                  <>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <SkeletonTableRow key={i} columns={6} />
                    ))}
                  </>
                )}

                {/* Error state */}
                {error && !isLoading && !isLoadingFiltered && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      <div className="py-8 text-center">
                        <p className="text-destructive font-medium mb-3">{error}</p>
                        <Button onClick={retryLoad} variant="outline" size="sm">
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {/* Empty state - only show when not loading, no error, and no items */}
                {!isLoading &&
                  !isLoadingFiltered &&
                  !error &&
                  searchFiltered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {filters.search ? (
                          <span>No users found matching "{filters.search}"</span>
                        ) : hasActiveFilters ? (
                          <span>No users found with the selected filters.</span>
                        ) : (
                          <span>No users found. Create your first user to get started.</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )}

                {/* Data rows */}
                {!isLoading &&
                  !isLoadingFiltered &&
                  !error &&
                  searchFiltered.map((user) => (
                    <TableRow key={user.id} className="hover:bg-accent/5">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 rounded-md bg-accent/20 text-xs">
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.department || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span
                          className={`px-2 py-1 rounded-md text-xs ${
                            user.is_active
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-red-500/20 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {user.is_active !== false ? 'Active' : 'Inactive'}
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
                  ))}
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
                  </TableRow>
                )}

                {/* Data rows */}
                {!isLoading &&
                  !error &&
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
                  ))}
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
