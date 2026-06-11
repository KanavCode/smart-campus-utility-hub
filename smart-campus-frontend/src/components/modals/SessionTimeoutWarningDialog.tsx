import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SessionTimeoutWarningDialogProps {
  open: boolean;
  onContinue: () => Promise<void> | void;
}

export const SessionTimeoutWarningDialog = ({ open, onContinue }: SessionTimeoutWarningDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={() => undefined}>
      <AlertDialogContent
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        className="max-w-md"
      >
        <AlertDialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle>Session expiring soon</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-sm leading-6">
            Your session is about to expire due to inactivity. Select Continue session to stay signed in.
            If you do not act, you will be logged out automatically.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onContinue} className="bg-primary text-primary-foreground">
            Continue session
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};