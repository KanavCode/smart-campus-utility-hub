import { useState, useEffect } from 'react';
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
import { Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { TwoFactorChallenge } from '@/types';

interface TwoFactorSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const TwoFactorSetupModal = ({ isOpen, onClose, onSuccess }: TwoFactorSetupModalProps) => {
  const { setupTwoFactor, verifyTwoFactorSetup, isLoading } = useAuth();
  const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');

  // Generate challenge when modal opens
  useEffect(() => {
    if (isOpen && !challenge) {
      handleGenerateChallenge();
    }
  }, [isOpen, challenge]);

  const handleGenerateChallenge = async () => {
    try {
      const data = await setupTwoFactor();
      setChallenge(data);
      setStep('setup');
    } catch (error) {
      toast.error('Failed to generate 2FA setup challenge');
      onClose();
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code');
      return;
    }

    if (!challenge) {
      toast.error('Challenge not generated');
      return;
    }

    setVerifyingCode(true);
    try {
      await verifyTwoFactorSetup(verificationCode, challenge.secret, challenge.backupCodes);
      setStep('backup');
      toast.success('2FA successfully enabled!');
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
      setVerificationCode('');
    } finally {
      setVerifyingCode(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClose = () => {
    setChallenge(null);
    setVerificationCode('');
    setStep('setup');
    setShowBackupCodes(false);
    setCopiedIndex(null);
    onClose();
  };

  const handleComplete = () => {
    handleClose();
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {step === 'setup' && challenge && (
          <>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <img src={challenge.qrCode} alt="2FA QR Code" className="w-48 h-48 border-2 border-gray-200 rounded-lg p-2" />
              </div>

              {/* Secret Key */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                <code className="block text-sm font-mono break-all text-gray-900 bg-white p-2 rounded border border-gray-300">
                  {challenge.secret}
                </code>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Enter 6-digit code from your app</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                  disabled={verifyingCode}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={verifyingCode}>
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || verifyingCode}
                  className="flex-1"
                  isLoading={verifyingCode}
                >
                  Verify & Enable
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'backup' && challenge && (
          <>
            <DialogHeader>
              <DialogTitle>Save Your Backup Codes</DialogTitle>
              <DialogDescription>
                Store these codes in a secure location. Each code can be used once if you lose access to your authenticator.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Backup Codes Display */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2">
                  {challenge.backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white p-2 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <code className="text-sm font-mono">{code}</code>
                      <button
                        onClick={() => copyBackupCode(code, index)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copy code"
                      >
                        {copiedIndex === index ? (
                          <Check size={16} className="text-green-600" />
                        ) : (
                          <Copy size={16} className="text-gray-600" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Show All / Hide Toggle */}
              <button
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                {showBackupCodes ? 'Hide codes' : 'Show all codes'}
              </button>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                <p className="font-semibold mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Download or print these codes</li>
                  <li>Store them somewhere safe and secure</li>
                  <li>Do not share these codes with anyone</li>
                </ul>
              </div>

              {/* Buttons */}
              <Button onClick={handleComplete} className="w-full">
                I've Saved My Codes
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
