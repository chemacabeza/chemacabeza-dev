"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type ReactNode,
} from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface AppInstallContextValue {
    canInstall: boolean;
    isInstalled: boolean;
    isStandalone: boolean;
    isPrompting: boolean;
    message: string;
    install: () => Promise<void>;
}

const AppInstallContext = createContext<AppInstallContextValue | null>(null);

function subscribeToDisplayMode(onChange: () => void) {
    const media = window.matchMedia("(display-mode: standalone)");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
}

function getDisplayMode() {
    return window.matchMedia("(display-mode: standalone)").matches;
}

function getServerDisplayMode() {
    return false;
}

/** Keep the browser's one-use prompt across client-side page navigation. */
export default function AppInstallProvider({ children }: { children: ReactNode }) {
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);
    const [installed, setInstalled] = useState(false);
    const [isPrompting, setIsPrompting] = useState(false);
    const [message, setMessage] = useState("");
    const isStandalone = useSyncExternalStore(
        subscribeToDisplayMode,
        getDisplayMode,
        getServerDisplayMode,
    );

    useEffect(() => {
        function onBeforeInstallPrompt(event: Event) {
            event.preventDefault();
            deferredPrompt.current = event as BeforeInstallPromptEvent;
            setCanInstall(true);
            setMessage("");
        }

        function onAppInstalled() {
            deferredPrompt.current = null;
            setCanInstall(false);
            setInstalled(true);
            setIsPrompting(false);
            setMessage("");
        }

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);
        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, []);

    const install = useCallback(async () => {
        const prompt = deferredPrompt.current;
        if (!prompt) return;

        // Consume the event before awaiting so a second tap cannot reuse it.
        deferredPrompt.current = null;
        setCanInstall(false);
        setIsPrompting(true);
        setMessage("");

        try {
            await prompt.prompt();
            const { outcome } = await prompt.userChoice;
            setMessage(
                outcome === "accepted"
                    ? "Installation requested. Finish any confirmation on your phone, then open chemacabeza.dev from your home screen."
                    : "Installation was cancelled. You can still install from Chrome's menu using the steps below.",
            );
        } catch {
            setMessage("The install prompt could not open. Use Chrome's menu and the steps below.");
        } finally {
            setIsPrompting(false);
        }
    }, []);

    const value = useMemo(
        () => ({
            canInstall,
            isInstalled: installed || isStandalone,
            isStandalone,
            isPrompting,
            message,
            install,
        }),
        [canInstall, installed, isStandalone, isPrompting, message, install],
    );

    return <AppInstallContext.Provider value={value}>{children}</AppInstallContext.Provider>;
}

export function useAppInstall() {
    const context = useContext(AppInstallContext);
    if (!context) throw new Error("useAppInstall requires AppInstallProvider");
    return context;
}
