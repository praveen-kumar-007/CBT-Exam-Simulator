import { useState, useEffect, useCallback, useRef } from "react";

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
  onSecurityEvent?: (event: {
    type: string;
    message: string;
    timestamp: string;
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
  isSecurityLock: boolean;
  securityLockReason: string | null;
  dismissWarning: () => void;
  /** Call this to fully reset all anti-cheat state (on exam restart) */
  reset: () => void;
}

export const useAntiCheat = ({
  enabled,
  trackViolations,
  maxViolations,
  onAutoSubmit,
  onSecurityEvent,
}: UseAntiCheatOptions): UseAntiCheatReturn => {
  const [violations, setViolations] = useState<ViolationEntry[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const [isSecurityLock, setIsSecurityLock] = useState(false);
  const [securityLockReason, setSecurityLockReason] = useState<string | null>(null);
  const violationCountRef = useRef(0);
  const violationsRef = useRef<ViolationEntry[]>([]);
  const autoSubmittedRef = useRef(false);
  const warningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const securityLockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFullScreenRef = useRef(false);
  const hasEnteredFullScreenRef = useRef(false);
  const trackViolationsRef = useRef(trackViolations);
  const lastViolationTimeRef = useRef<number>(0);

  // Keep the ref in sync with the prop
  useEffect(() => {
    trackViolationsRef.current = trackViolations;
  }, [trackViolations]);

  useEffect(() => {
    violationsRef.current = violations;
  }, [violations]);

  const triggerSecurityLock = useCallback(
    (message: string) => {
      if (securityLockTimeoutRef.current) {
        clearTimeout(securityLockTimeoutRef.current);
      }
      setIsSecurityLock(true);
      setSecurityLockReason(message);
      securityLockTimeoutRef.current = setTimeout(() => {
        setIsSecurityLock(false);
        setSecurityLockReason(null);
      }, 4000);
    },
    [],
  );

  const addViolation = useCallback(
    (type: string, message: string) => {
      // Don't count new violations if tracking is off (disqualified state)
      if (!trackViolationsRef.current) return;
      if (autoSubmittedRef.current) return;

      const now = Date.now();
      // Debounce violations to prevent cascade false-positives (e.g., blur + visibilitychange firing together)
      if (now - lastViolationTimeRef.current < 2000) {
        return;
      }
      lastViolationTimeRef.current = now;

      const entry: ViolationEntry = {
        type,
        timestamp: new Date(),
        message,
      };

      if (
        type === "screenshot_attempt" ||
        type === "devtools_open" ||
        type === "right_click" ||
        type === "context_menu" ||
        type === "blocked_keyboard"
      ) {
        triggerSecurityLock(message);
      }

      const newCount = violationCountRef.current + 1;
      violationCountRef.current = newCount;

      setViolations((prev) => [...prev, entry]);

      onSecurityEvent?.({
        type,
        message,
        timestamp: entry.timestamp.toISOString(),
      });

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
          `⚠️ VIOLATION DETECTED: ${message}\n\nWarning ${newCount}/${maxViolations} — ${remaining} more violation${remaining > 1 ? "s" : ""} will auto-submit your exam!`,
        );

        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
        warningTimeoutRef.current = setTimeout(() => {
          setWarningMessage(null);
        }, 5000);
      }
    },
    [maxViolations, onAutoSubmit, onSecurityEvent, triggerSecurityLock],
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
      console.warn(
        "Failed to enter full-screen (might be unsupported on this device):",
        err,
      );
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
      console.warn("Failed to exit full-screen:", err);
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
          addViolation("fullscreen_exit", "You exited full-screen mode");
        }
        // ALWAYS try to re-enter full-screen, even on disqualified screen
        setTimeout(() => {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }, 300);
      }
    };

    // --- Visibility change detection (tab switching) ---
    const handleVisibilityChange = () => {
      if (
        document.hidden &&
        trackViolationsRef.current &&
        !autoSubmittedRef.current
      ) {
        addViolation("tab_switch", "You switched to another tab or window");
      }
    };

    // --- Window blur detection ---
    const handleWindowBlur = () => {
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation("window_blur", "You switched away from the exam window");
      }
    };

    // --- Keyboard shortcut blocking (ALWAYS active while enabled, even after disqualification) ---
    const handleKeyDown = (e: KeyboardEvent) => {
      const blockedCombinations = [
        { key: "Tab", alt: true, message: "Tab switch blocked" },
        { key: "Tab", ctrl: true, message: "Tab switch blocked" },
        { key: "F4", alt: true, message: "Window close blocked" },
        { key: "w", ctrl: true, message: "Window close blocked" },
        { key: "n", ctrl: true, message: "New window blocked" },
        { key: "t", ctrl: true, message: "New tab blocked" },
        { key: "I", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "i", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "J", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "j", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "C", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "c", ctrl: true, shift: true, type: "devtools_open", message: "DevTools blocked" },
        { key: "F12", type: "devtools_open", message: "DevTools blocked" },
        { key: "u", ctrl: true, message: "Source view blocked" },
        { key: "s", ctrl: true, message: "Save blocked" },
        { key: "s", ctrl: true, shift: true, type: "screenshot_attempt", message: "Screenshot blocked" },
        { key: "p", ctrl: true, message: "Print preview blocked" },
        { key: "a", ctrl: true, message: "Select all blocked" },
        { key: "PrintScreen", type: "screenshot_attempt", message: "Screenshot key blocked" },
        { key: "3", meta: true, shift: true, type: "screenshot_attempt", message: "Screenshot blocked" },
        { key: "4", meta: true, shift: true, type: "screenshot_attempt", message: "Screenshot blocked" },
        { key: "Escape" },
      ];

      for (const combo of blockedCombinations) {
        const keyMatch =
          e.key === combo.key ||
          e.key.toLowerCase() === combo.key?.toLowerCase();
        const ctrlMatch = combo.ctrl ? e.ctrlKey || e.metaKey : true;
        const altMatch = combo.alt ? e.altKey : true;
        const shiftMatch = combo.shift ? e.shiftKey : true;
        const metaMatch = combo.meta ? e.metaKey : true;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          e.preventDefault();
          e.stopPropagation();

          // Only add violation if still tracking and not Escape
          if (
            e.key !== "Escape" &&
            trackViolationsRef.current &&
            !autoSubmittedRef.current
          ) {
            const violationType = combo.type || "blocked_keyboard";
            const message = combo.message ||
              `Blocked keyboard shortcut: ${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.altKey ? "Alt+" : ""}${e.metaKey ? "Meta+" : ""}${e.key}`;
            addViolation(violationType, message);
          }
          return;
        }
      }
    };

    // --- Right-click prevention (ALWAYS active while enabled) ---
    const handleContextMenu = (e: Event) => {
      e.preventDefault();
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation("right_click", "Right-click is disabled during the exam");
      }
    };

    // --- Copy/Cut/Paste prevention (ALWAYS active while enabled) ---
    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
    };

    // --- Aggressive Full Screen Enforcement (Background & Interaction) ---
    const enforceFullScreen = () => {
      if (hasEnteredFullScreenRef.current && !document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
        // Also try alternatives for cross-browser
        if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any)
            .webkitRequestFullscreen()
            ?.catch(() => {});
        }
      }
    };

    const enforceFullScreenInterval = setInterval(enforceFullScreen, 500);

    // Any click on the page should attempt to restore full screen (bypasses browser gesture restrictions)
    const handleGlobalClick = () => {
      enforceFullScreen();
    };

    // --- Page refresh warning ---
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Show warning only if actively taking the exam and not auto-submitting
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        e.preventDefault();
        e.returnValue = ""; // Setting returnValue triggers the browser's confirmation dialog
        return "";
      }
    };

    const handlePageHide = () => {
      if (trackViolationsRef.current && !autoSubmittedRef.current) {
        addViolation("page_hide", "You left or closed the exam page");
      }
    };

    // --- Attach event listeners ---
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("click", handleGlobalClick, true);

    // Disable text selection
    document.body.style.userSelect = "none";
    (document.body.style as any).webkitUserSelect = "none";

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullScreenChange,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("click", handleGlobalClick, true);
      clearInterval(enforceFullScreenInterval);

      // Restore text selection
      document.body.style.userSelect = "";
      (document.body.style as any).webkitUserSelect = "";

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
    isSecurityLock,
    securityLockReason,
    dismissWarning,
    reset,
  };
};
