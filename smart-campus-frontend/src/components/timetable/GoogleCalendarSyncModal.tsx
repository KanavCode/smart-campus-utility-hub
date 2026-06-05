import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, CheckCircle2, ExternalLink, Loader2, AlertCircle, CalendarCheck, Wifi, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { calendarService, CalendarSyncStatus } from '@/services/calendarService';

interface GoogleCalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  academicYear: string;
  semesterType: string;
}

// ─── Google "G" logo as an SVG component ─────────────────────────────────────
const GoogleLogo = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ─── Feature pill ─────────────────────────────────────────────────────────────
const FeaturePill = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs text-accent font-medium">
    <Icon className="h-3.5 w-3.5" />
    {text}
  </div>
);

// ─── Step indicator ───────────────────────────────────────────────────────────
const Step = ({
  number,
  title,
  description,
  active,
  done,
}: {
  number: number;
  title: string;
  description: string;
  active?: boolean;
  done?: boolean;
}) => (
  <div className={`flex gap-3 p-3 rounded-lg transition-all ${active ? 'bg-accent/10 border border-accent/30' : 'opacity-60'}`}>
    <div
      className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
        done
          ? 'bg-emerald-500 border-emerald-500 text-white'
          : active
          ? 'border-accent text-accent'
          : 'border-border text-muted-foreground'
      }`}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : number}
    </div>
    <div>
      <p className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </div>
  </div>
);

// ─── Main modal ───────────────────────────────────────────────────────────────
export function GoogleCalendarSyncModal({
  isOpen,
  onClose,
  groupId,
  groupName,
  academicYear,
  semesterType,
}: GoogleCalendarSyncModalProps) {
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Check if user already has Google connected
  useEffect(() => {
    if (!isOpen) return;
    const check = async () => {
      setIsCheckingStatus(true);
      try {
        const status = await calendarService.getSyncStatus();
        setSyncStatus(status);
      } catch {
        setSyncStatus({ connected: false });
      } finally {
        setIsCheckingStatus(false);
      }
    };
    void check();
  }, [isOpen]);

  const handleConnectGoogle = () => {
    if (!groupId) {
      toast.error('Please select a group first before syncing.');
      return;
    }
    setIsRedirecting(true);
    // Small delay so user sees the loading state before redirect
    setTimeout(() => {
      calendarService.initiateGoogleAuth(groupId, academicYear, semesterType);
    }, 600);
  };

  const handleDisconnect = async () => {
    try {
      await calendarService.disconnect();
      setSyncStatus({ connected: false });
      toast.success('Google Calendar disconnected successfully.');
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header gradient banner ── */}
              <div className="relative bg-gradient-to-br from-blue-600/20 via-accent/10 to-emerald-600/10 border-b border-border p-6 pb-5">
                {/* Close button */}
                <button
                  onClick={onClose}
                  disabled={isRedirecting}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                  aria-label="Close modal"
                  id="google-calendar-modal-close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-start gap-4">
                  {/* Icon cluster */}
                  <div className="relative flex-shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                      <GoogleLogo className="h-8 w-8" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                      <CalendarCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-foreground">Sync to Google Calendar</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Push your timetable directly into{' '}
                      <span className="text-foreground font-medium">Google Calendar</span> — no downloads needed.
                    </p>
                  </div>
                </div>

                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <FeaturePill icon={Zap} text="Auto-sync weekly" />
                  <FeaturePill icon={ShieldCheck} text="Secure OAuth2" />
                  <FeaturePill icon={Wifi} text="Recurring events" />
                </div>
              </div>

              {/* ── Body ── */}
              <div className="p-6 space-y-5">

                {/* Timetable context */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border text-sm">
                  <CalendarCheck className="h-4 w-4 text-accent flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-foreground">{groupName}</span>
                    <span className="text-muted-foreground">
                      {' '}· AY {academicYear} · {semesterType.charAt(0).toUpperCase() + semesterType.slice(1)} Sem
                    </span>
                  </div>
                </div>

                {/* How it works steps */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                    How it works
                  </p>
                  <Step
                    number={1}
                    title="Authorize with Google"
                    description="You'll be redirected to Google's secure consent screen."
                    active={!syncStatus?.connected}
                    done={syncStatus?.connected}
                  />
                  <Step
                    number={2}
                    title="We create calendar events"
                    description="Each weekly class is added as a recurring Google Calendar event."
                    active={false}
                  />
                  <Step
                    number={3}
                    title="Stay in sync"
                    description="Timetable changes in the portal automatically update your calendar."
                    active={false}
                  />
                </div>

                {/* Already connected banner */}
                {syncStatus?.connected && !isCheckingStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Google Calendar Connected
                      </p>
                      {syncStatus.google_email && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          Linked to <span className="font-medium">{syncStatus.google_email}</span>
                        </p>
                      )}
                      {syncStatus.last_synced_at && (
                        <p className="text-xs text-muted-foreground">
                          Last synced: {new Date(syncStatus.last_synced_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Security note */}
                <div className="flex gap-2 text-xs text-muted-foreground p-2.5 rounded-lg bg-muted/40">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                  <p>
                    We only request <strong>Calendar write access</strong>. Your Google password is never shared with us.
                    You can revoke access at any time from your{' '}
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground transition-colors"
                    >
                      Google Account settings
                      <ExternalLink className="inline h-3 w-3 ml-0.5" />
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* ── Footer / Actions ── */}
              <div className="px-6 pb-6 space-y-3">
                {isCheckingStatus ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking connection status…
                  </div>
                ) : syncStatus?.connected ? (
                  <div className="flex flex-col gap-2">
                    {/* Re-sync */}
                    <Button
                      id="google-calendar-resync-btn"
                      onClick={handleConnectGoogle}
                      disabled={isRedirecting}
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-lg shadow-blue-500/20"
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting to Google…
                        </>
                      ) : (
                        <>
                          <GoogleLogo className="h-4 w-4" />
                          Re-sync / Re-authorize
                        </>
                      )}
                    </Button>
                    {/* Disconnect */}
                    <Button
                      id="google-calendar-disconnect-btn"
                      variant="outline"
                      onClick={handleDisconnect}
                      className="w-full gap-2 text-red-500 border-red-500/30 hover:bg-red-500/10"
                    >
                      Disconnect Google Calendar
                    </Button>
                  </div>
                ) : (
                  <Button
                    id="google-calendar-connect-btn"
                    onClick={handleConnectGoogle}
                    disabled={isRedirecting || !groupId}
                    className="w-full gap-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0 shadow-lg shadow-blue-500/25 py-5 text-sm font-semibold"
                  >
                    {isRedirecting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting to Google…
                      </>
                    ) : (
                      <>
                        <GoogleLogo className="h-5 w-5" />
                        Connect & Sync with Google Calendar
                        <ExternalLink className="h-4 w-4 ml-auto opacity-70" />
                      </>
                    )}
                  </Button>
                )}

                {!groupId && !isCheckingStatus && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-500/10 rounded-lg px-3 py-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    Select a group above before syncing to Google Calendar.
                  </div>
                )}

                <Button
                  id="google-calendar-cancel-btn"
                  variant="ghost"
                  onClick={onClose}
                  disabled={isRedirecting}
                  className="w-full text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
