import { useState, useEffect, useCallback, useRef } from 'react';

export interface ViolationEntry {
  type: string;
  timestamp: Date;
  message: string;
}

interface UseAntiCheatOptions {
  /** Whether anti-cheat monitoring is active (should be true during exam AND on disqualified screen) */
  enabled: boolean;
  /** Whether to track new violations (false on disqualified screen — protections stay but no new counting) */
  trackViolations: boolean;
  maxViolations: number;
  onAutoSubmit: (context: {
    violationCount: number;
    violations: ViolationEntry[];
    trigger: ViolationEntry;
  }) => void;
}

interface UseAntiCheatReturn {
  violations: ViolationEntry[];
  violationCount: number;
  maxViolations: number;
  isFullScreen: boolean;
  enterFullScreen: () => Promise<void>;
  exitFullScreen: () => Promise<void>;
  warningMessage: string | null;
  isAutoSubmitted: boolean;
  dismissWarning: () => void;
  /** Call this to fully reset all anti-cheat state (on exam restart) */
  reset: () => void;
}

export const useAntiCheat = ({
  enabled,
  trackViolations,
  maxViolations,
  onAutoSubmit,
}: UseAntiCheatOptions): UseAntiCheatReturn => {
  const [violations, setViolations] = useState<ViolationEntry[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const violationCountRef = useRef(0);
  const violationsRef = useRef<ViolationEntry[]>([]);
  const autoSubmittedRef = useRef(false);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFullScreenRef = useRef(false);
  const hasEnteredFullScreenRef = useRef(false);
  const trackViolationsRef = useRef(trackViolations);

  // Keep the ref in sync with the prop
  useEffect(() => {
    trackViolationsRef.current = trackViolations;
  }, [trackViolations]);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  const addViolation = useCallback(
    (type: string, message: string) => {
      // Don't count new violations if tracking is off (disqualified state)
      if (!trackViolationsRef.current) return;
      if (autoSubmittedRef.current) return;

      const newCount = violationCountRef.current + 1;
      violationCountRef.current = newCount;

      const entry: ViolationEntry = {
        type,
        timestamp: new Date(),
        message,
      };

      setViolations((prev) => [...prev, entry]);

      if (newCount >= maxViolations) {
        autoSubmittedRef.current = true;
        setIsAutoSubmitted(true);
        setWarningMessage(null);
        const allViolations = [...violationsRef.current, entry];
        onAutoSubmit({
          violationCount: newCount,
          violations: allViolations,
          trigger: entry,
        });
      } else {
        const remaining = maxViolations - newCount;
        setWarningMessage(
          `⚠️ VIOLATION DETECTED: ${message}\n\nWarning ${newCount}/${maxViolations} — ${remaining} more violation${remaining > 1 ? 's' : ''} will auto-submit your exam!`
        );

        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
          setWarningMessage(null);
        }, 5000);
      }
    },
    [maxViolations, onAutoSubmit]
  );

  const dismissWarning = useCallback(() => {
    setWarningMessage(null);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  const enterFullScreen = useCallback(async () => {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        await (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        await (el as any).msRequestFullscreen();
      }
      hasEnteredFullScreenRef.current = true;
    } catch (err) {
      console.warn('Failed to enter full-screen (might be unsupported on this device):', err);
      // Fallback for mobile devices (like iOS Safari) that block requestFullscreen
      hasEnteredFullScreenRef.current = true;
    }
  }, []);

  const exitFullScreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Failed to exit full-screen:', err);
    }
  }, []);

  /** Fully resets all internal state — call on exam restart / return to login */
  const reset = useCallback(() => {
    violationCountRef.current = 0;
    autoSubmittedRef.current = false;
    hasEnteredFullScreenRef.current = false;
    isFullScreenRef.current = false;
    setViolations([]);
    setIsFullScreen(false);
    setWarningMessage(null);
    setIsAutoSubmitted(false);
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // --- Full-screen change detection ---
    const handleFullScreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullScreen(isFull);
      isFullScreenRef.current = isFull;

      if (!isFull && hasEnteredFullScreenRef.current) {
        // Count as violation only if still tracking
        if (trackViolationsRef.current && !autoSubmittedRef.current) {
          addViolation('fullscreen_exit', 'You exited full-screen mode');
        }
        // ALWAYS try to re-enter full-screen, even on disqualified screen
        setTimeout(() => {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }, 300);
      }
    };

    // --- Visibility change detection (tab switching) ---
    const handleVisibilityChange = () => {
      if (document.hidden && trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation('tab_switch', 'You switched to another tab or window');
      }
    };

    // --- Window blur detection ---
    const handleWindowBlur = () => {
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation('window_blur', 'You switched away from the exam window');
      }
    };

    // --- Keyboard shortcut blocking (ALWAYS active while enabled, even after disqualification) ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedCombinations = [
        { key: 'Tab', alt: true },
        { key: 'Tab', ctrl: true },
        { key: 'F4', alt: true },
        { key: 'w', ctrl: true },
        { key: 'n', ctrl: true },
        { key: 't', ctrl: true },
        { key: 'I', ctrl: true, shift: true },
        { key: 'i', ctrl: true, shift: true },
        { key: 'J', ctrl: true, shift: true },
        { key: 'j', ctrl: true, shift: true },
        { key: 'C', ctrl: true, shift: true },
        { key: 'c', ctrl: true, shift: true },
        { key: 'F12' },
        { key: 'u', ctrl: true },
        { key: 's', ctrl: true },
        { key: 'p', ctrl: true },
        { key: 'a', ctrl: true },
        { key: 'PrintScreen' },
        { key: 'Escape' },
      ];

      for (const combo of blockedCombinations) {
        const keyMatch = e.key === combo.key || e.key.toLowerCase() === combo.key?.toLowerCase();
        const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true;
        const altMatch = combo.alt ? e.altKey : true;
        const shiftMatch = combo.shift ? e.shiftKey : true;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          e.preventDefault();
          e.stopPropagation();

          // Only add violation if still tracking and not Escape
          if (e.key !== 'Escape' && trackViolationsRef.current && !autoSubmittedRef.current) {
            addViolation(
              'blocked_keyboard',
              `Blocked keyboard shortcut: ${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.altKey ? 'Alt+' : ''}${e.key}`
            );
          }
          return;
        }
      }
    };

    // --- Right-click prevention (ALWAYS active while enabled) ---
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation('right_click', 'Right-click is disabled during the exam');
      }
    };

    // --- Copy/Cut/Paste prevention (ALWAYS active while enabled) ---
    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
    };

    // --- DevTools detection ---
    const devToolsCheckInterval = setInterval(() => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 200 || heightDiff > 200) {
        if (trackViolationsRef.current && !autoSubmittedRef.current) {
          addViolation('devtools', 'Developer Tools detected — close them immediately');
        }
      }
    }, 3000);
    // --- Page refresh warning ---
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning only if actively taking the exam and not auto-submitting
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = ''; // Setting returnValue triggers the browser's confirmation dialog
        return '';
      }
    };

    // --- Attach event listeners ---
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Disable text selection
    document.body.style.userSelect = 'none';
    (document.body.style as any).webkitUserSelect = 'none';

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(devToolsCheckInterval);

      // Restore text selection
      document.body.style.userSelect = '';
      (document.body.style as any).webkitUserSelect = '';

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled, addViolation]);

  return {
    violations,
    violationCount: violations.length,
    maxViolations,
    isFullScreen,
    enterFullScreen,
    exitFullScreen,
    warningMessage,
    isAutoSubmitted,
    dismissWarning,
    reset,
  };
};
