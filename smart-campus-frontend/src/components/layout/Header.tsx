import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, LogOut, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { notificationApiService, UserNotification } from '@/services/notificationApiService';
import { useNotification } from '@/contexts/NotificationContext';
import { GlobalSearch } from './GlobalSearch';

export const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { lastEventAt } = useNotification();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const initials = user?.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || 'U';

  const loadNotifications = async () => {
    try {
      const response = await notificationApiService.getMyNotifications({ limit: 8 });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch {
      // noop
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (!lastEventAt) return;
    loadNotifications();
  }, [lastEventAt]);

  const markAsRead = async (id: number) => {
    await notificationApiService.markAsRead(id);
    await loadNotifications();
  };

  const markAllAsRead = async () => {
    await notificationApiService.markAllAsRead();
    await loadNotifications();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-20 right-0 z-40 h-16 glass border-b border-border/50"
    >
      <div className="h-full px-6 flex items-center justify-between gap-4">
        <div className="flex-1 max-w-xl">
          <GlobalSearch />
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-full p-2 hover:bg-accent/40 transition-colors">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass border-border/50">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            {notifications.length === 0 ? (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No notifications yet
              </DropdownMenuItem>
            ) : (
              notifications.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`cursor-pointer whitespace-normal py-2 ${item.is_read ? 'opacity-70' : ''}`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.message}</p>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="focus:outline-none"
            >
              <Avatar className="h-9 w-9 border-2 border-primary glow-primary-hover cursor-pointer">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 glass border-border/50">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              onClick={() => navigate('/profile')}
              className="cursor-pointer hover:bg-accent/50"
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
};
