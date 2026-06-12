import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/axios';

const SESSION_LAST_ACTIVITY_KEY = 'smart-campus-session-last-activity';
const SESSION_WARNING_STATE_KEY = 'smart-campus-session-warning-state';
const SESSION_LOGOUT_EVENT_KEY = 'smart-campus-session-logout-event';

const DEFAULT_SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const DEFAULT_WARNING_WINDOW_MS = 2 * 60 * 1000;

interface SessionWarningState {
  open: boolean;
  expiresAt: number | null;
}

interface UseSessionTimeoutWarningOptions {
  enabled: boolean;
  onExpire: () => Promise<void> | void;
  timeoutMs?: number;
  warningWindowMs?: number;
}

const readStoredLastActivity = () => {
  const storedValue = window.localStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
  const parsedValue = Number(storedValue);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : null;
};

const readStoredWarningState = (): SessionWarningState | null => {
  const storedValue = window.localStorage.getItem(SESSION_WARNING_STATE_KEY);
  if (!storedValue) return null;

  try {
    const parsedState = JSON.parse(storedValue) as SessionWarningState;
    if (typeof parsedState.open !== 'boolean') return null;
    return {
      open: parsedState.open,
      expiresAt: typeof parsedState.expiresAt === 'number' ? parsedState.expiresAt : null,
    };
  } catch {
    return null;
  }
};

export function useSessionTimeoutWarning({
  enabled,
  onExpire,
  timeoutMs = DEFAULT_SESSION_TIMEOUT_MS,
  warningWindowMs = DEFAULT_WARNING_WINDOW_MS,
}: UseSessionTimeoutWarningOptions) {
  const [isWarningOpen, setIsWarningOpen] = useState(false);
  const warningTimerRef = useRef<number | null>(null);
  const expireTimerRef = useRef<number | null>(null);
  const isExpiringRef = useRef(false);
  const isRefreshingRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current !== null) {
      window.clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }

    if (expireTimerRef.current !== null) {
      window.clearTimeout(expireTimerRef.current);
      expireTimerRef.current = null;
    }
  }, []);

  const setWarningState = useCallback((state: SessionWarningState | null) => {
    if (!state) {
      window.localStorage.removeItem(SESSION_WARNING_STATE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_WARNING_STATE_KEY, JSON.stringify(state));
  }, []);

  const scheduleTimers = useCallback((lastActivityAt: number) => {
    clearTimers();

    const now = Date.now();
    const elapsed = now - lastActivityAt;
    const remaining = timeoutMs - elapsed;

    if (remaining <= 0) {
      void (async () => {
        if (isExpiringRef.current) return;
        isExpiringRef.current = true;
        setIsWarningOpen(false);
        setWarningState(null);
        window.localStorage.setItem(SESSION_LOGOUT_EVENT_KEY, String(Date.now()));
        try {
          await onExpire();
        } finally {
          isExpiringRef.current = false;
        }
      })();
      return;
    }

    const warningDelay = Math.max(remaining - warningWindowMs, 0);

    warningTimerRef.current = window.setTimeout(() => {
      const expiresAt = Date.now() + Math.max(timeoutMs - (Date.now() - lastActivityAt), 0);
      setIsWarningOpen(true);
      setWarningState({ open: true, expiresAt });
    }, warningDelay);

    expireTimerRef.current = window.setTimeout(() => {
      if (isExpiringRef.current) return;
      isExpiringRef.current = true;
      setIsWarningOpen(false);
      setWarningState(null);
      window.localStorage.setItem(SESSION_LOGOUT_EVENT_KEY, String(Date.now()));
      void Promise.resolve(onExpire()).finally(() => {
        isExpiringRef.current = false;
      });
    }, remaining);
  }, [clearTimers, onExpire, setWarningState, timeoutMs, warningWindowMs]);

  const recordActivity = useCallback(() => {
    if (!enabled) return;

    const now = Date.now();
    window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(now));
    setIsWarningOpen(false);
    setWarningState(null);
    scheduleTimers(now);
  }, [enabled, scheduleTimers, setWarningState]);

  const continueSession = useCallback(async () => {
    if (!enabled || isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    try {
      await api.post('/auth/refresh');
      recordActivity();
    } catch {
      if (!isExpiringRef.current) {
        isExpiringRef.current = true;
        setIsWarningOpen(false);
        setWarningState(null);
        window.localStorage.setItem(SESSION_LOGOUT_EVENT_KEY, String(Date.now()));
        await onExpire();
        isExpiringRef.current = false;
      }
    } finally {
      isRefreshingRef.current = false;
    }
  }, [enabled, onExpire, recordActivity, setWarningState]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setIsWarningOpen(false);
      return;
    }

    const storedLastActivity = readStoredLastActivity();
    const initialActivity = storedLastActivity ?? Date.now();

    if (storedLastActivity === null) {
      window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, String(initialActivity));
    }

    const storedWarningState = readStoredWarningState();
    if (storedWarningState?.open) {
      setIsWarningOpen(true);
    }

    scheduleTimers(initialActivity);

    const handleUserActivity = () => {
      recordActivity();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_LAST_ACTIVITY_KEY && event.newValue) {
        const parsedValue = Number(event.newValue);
        if (Number.isFinite(parsedValue) && parsedValue > 0) {
          setIsWarningOpen(false);
          setWarningState(null);
          scheduleTimers(parsedValue);
        }
      }

      if (event.key === SESSION_WARNING_STATE_KEY) {
        const nextWarningState = readStoredWarningState();
        setIsWarningOpen(Boolean(nextWarningState?.open));
      }

      if (event.key === SESSION_LOGOUT_EVENT_KEY && event.newValue) {
        if (!isExpiringRef.current) {
          isExpiringRef.current = true;
          setIsWarningOpen(false);
          setWarningState(null);
          void Promise.resolve(onExpire()).finally(() => {
            isExpiringRef.current = false;
          });
        }
      }
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('focus', handleUserActivity);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearTimers();
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('focus', handleUserActivity);
      window.removeEventListener('storage', handleStorage);
    };
  }, [clearTimers, enabled, onExpire, recordActivity, scheduleTimers, setWarningState]);

  return {
    isWarningOpen,
    continueSession,
  };
}