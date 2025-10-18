// src/components/SessionWarning.tsx
import React, { useState, useEffect } from 'react';
import { useSessionManager } from '../lib/sessionManager';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Clock, RefreshCw } from 'lucide-react';

interface SessionWarningProps {
    onSessionExpired?: () => void;
    onExtendSession?: () => void;
}

export const SessionWarning: React.FC<SessionWarningProps> = ({
    onSessionExpired,
    onExtendSession
}) => {
    const sessionManager = useSessionManager();
    const [showWarning, setShowWarning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const checkSession = () => {
            if (!sessionManager.isSessionValid()) {
                setShowWarning(false);
                onSessionExpired?.();
                return;
            }

            if (sessionManager.isSessionExpiringSoon()) {
                setShowWarning(true);
                setTimeRemaining(sessionManager.formatTimeRemaining());
            } else {
                setShowWarning(false);
            }
        };

        // Check session every 30 seconds
        const interval = setInterval(checkSession, 30000);
        checkSession(); // Initial check

        return () => clearInterval(interval);
    }, [sessionManager, onSessionExpired]);

    const handleExtendSession = () => {
        sessionManager.extendSession();
        setShowWarning(false);
        onExtendSession?.();
    };

    const handleLogout = () => {
        sessionManager.clearSession();
        onSessionExpired?.();
    };

    if (!showWarning) return null;

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md">
            <Alert className="border-orange-200 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Session Expiring Soon</p>
                            <p className="text-sm">Your session will expire in {timeRemaining}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleExtendSession}
                                className="text-orange-700 border-orange-300 hover:bg-orange-100"
                            >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Extend
                            </Button>
                            <Button
                                size="sm"
                                variant="destructive"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
};
