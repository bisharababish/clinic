// components/LoadingScreen.tsx - Single loading screen for entire app
import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
    return (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg font-medium">{message}</p>
                <div className="mt-4">
                    <div className="w-64 bg-gray-200 rounded-full h-1 mx-auto">
                        <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;


