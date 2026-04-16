import React, { useEffect, useState } from 'react';

type NotificationBannerProps = {
    message: string | null;
    type?: 'success' | 'error' | 'info';
    sectionLabel?: string;
    durationMs?: number;
    onDismiss?: () => void;
};

const NotificationBanner: React.FC<NotificationBannerProps> = ({
    message,
    type = 'info',
    sectionLabel,
    durationMs = 2500,
    onDismiss,
}) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!message) {
            setVisible(false);
            return;
        }

        setVisible(true);
        const timer = window.setTimeout(() => {
            setVisible(false);
            onDismiss?.();
        }, durationMs);

        return () => window.clearTimeout(timer);
    }, [message, durationMs, onDismiss]);

    if (!message || !visible) {
        return null;
    }

    const toneClasses =
        type === 'success'
            ? 'bg-emerald-600 text-white'
            : type === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-700 text-white';

    return (
        <div className="fixed top-16 left-0 right-0 z-50 w-full border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-sm sm:top-0">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                {sectionLabel ? (
                    <div className="text-sm font-semibold text-slate-900">{sectionLabel}</div>
                ) : null}
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow ${toneClasses}`}>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                        {type === 'success' ? '✓' : type === 'error' ? '!' : 'i'}
                    </span>
                    <span>{message}</span>
                </div>
            </div>
        </div>
    );
};

export default NotificationBanner;
