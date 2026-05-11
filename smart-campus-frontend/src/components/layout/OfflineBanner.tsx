import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, AlertTriangle } from 'lucide-react';
import { useConnectivity } from '@/contexts/ConnectivityContext';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useConnectivity();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-amber-500 text-white overflow-hidden"
        >
          <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span>You are currently offline. Some features may be limited.</span>
            <div className="hidden sm:flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-white/20 rounded text-[10px] uppercase tracking-wider">
              <AlertTriangle className="h-3 w-3" />
              Offline Mode
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
