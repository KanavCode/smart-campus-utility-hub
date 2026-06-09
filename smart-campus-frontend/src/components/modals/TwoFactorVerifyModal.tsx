import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface TwoFactorVerifyModalProps {
  isOpen: boolean;
  tempUserId: number | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TwoFactorVerifyModal = ({ isOpen, tempUserId, onSuccess, onCancel }: TwoFactorVerifyModalProps) => {
  const { verifyTwoFactorCode, isLoading } = useAuth();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!code.trim() || code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (!tempUserId) {
      setError('Invalid session. Please login again.');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      await verifyTwoFactorCode(tempUserId, code);
      toast.success('Login successful!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError('Invalid 2FA code. Please try again.');
      toast.error('Invalid 2FA code');
      setCode('');
    } finally {
      setVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === 6 && !verifying) {
      handleVerify();
    }
  };

  const handleCancel = () => {
    setCode('');
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Enter 2FA Code</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code from your authenticator app
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Code Input */}
          <div>
            <label className="block text-sm font-medium mb-2">6-Digit Code</label>
            <Input
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest"
              disabled={verifying || isLoading}
              autoFocus
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Help Text */}
          <p className="text-xs text-gray-600">
            Enter the code from your authenticator app or use a backup code
          </p>

          {/* Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={verifying || isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleVerify}
              disabled={code.length !== 6 || verifying || isLoading}
              className="flex-1"
              isLoading={verifying}
            >
              Verify
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
