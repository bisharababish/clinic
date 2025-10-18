// src/lib/sessionManager.ts
// Session management utilities

export const SESSION_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

export interface SessionInfo {
    expiresAt: number;
    lastActivity: number;
    userId: string;
}

export class SessionManager {
    private static instance: SessionManager;
    private sessionKey = 'bethlehem-session-info';
    private warningTime = 5 * 60 * 1000; // 5 minutes before expiry

    static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    // Initialize session tracking
    initializeSession(userId: string): void {
        const sessionInfo: SessionInfo = {
            expiresAt: Date.now() + SESSION_TIMEOUT,
            lastActivity: Date.now(),
            userId
        };
        localStorage.setItem(this.sessionKey, JSON.stringify(sessionInfo));
    }

    // Update last activity time
    updateActivity(): void {
        const sessionInfo = this.getSessionInfo();
        if (sessionInfo) {
            sessionInfo.lastActivity = Date.now();
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionInfo));
        }
    }

    // Check if session is still valid
    isSessionValid(): boolean {
        const sessionInfo = this.getSessionInfo();
        if (!sessionInfo) return false;

        const now = Date.now();
        return now < sessionInfo.expiresAt;
    }

    // Check if session is about to expire (for warnings)
    isSessionExpiringSoon(): boolean {
        const sessionInfo = this.getSessionInfo();
        if (!sessionInfo) return false;

        const now = Date.now();
        const timeUntilExpiry = sessionInfo.expiresAt - now;
        return timeUntilExpiry <= this.warningTime && timeUntilExpiry > 0;
    }

    // Get time remaining in session
    getTimeRemaining(): number {
        const sessionInfo = this.getSessionInfo();
        if (!sessionInfo) return 0;

        const now = Date.now();
        return Math.max(0, sessionInfo.expiresAt - now);
    }

    // Extend session
    extendSession(): void {
        const sessionInfo = this.getSessionInfo();
        if (sessionInfo) {
            sessionInfo.expiresAt = Date.now() + SESSION_TIMEOUT;
            sessionInfo.lastActivity = Date.now();
            localStorage.setItem(this.sessionKey, JSON.stringify(sessionInfo));
        }
    }

    // Clear session
    clearSession(): void {
        localStorage.removeItem(this.sessionKey);
    }

    // Get session info
    private getSessionInfo(): SessionInfo | null {
        try {
            const stored = localStorage.getItem(this.sessionKey);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }

    // Format time remaining for display
    formatTimeRemaining(): string {
        const timeRemaining = this.getTimeRemaining();
        const minutes = Math.floor(timeRemaining / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    }
}

// React hook for session management
export const useSessionManager = () => {
    const sessionManager = SessionManager.getInstance();

    return {
        initializeSession: (userId: string) => sessionManager.initializeSession(userId),
        updateActivity: () => sessionManager.updateActivity(),
        isSessionValid: () => sessionManager.isSessionValid(),
        isSessionExpiringSoon: () => sessionManager.isSessionExpiringSoon(),
        getTimeRemaining: () => sessionManager.getTimeRemaining(),
        extendSession: () => sessionManager.extendSession(),
        clearSession: () => sessionManager.clearSession(),
        formatTimeRemaining: () => sessionManager.formatTimeRemaining(),
    };
};
