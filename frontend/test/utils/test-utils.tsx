import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../hooks/useAuth';
import { AdminStateProvider } from '../../hooks/useAdminState';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    });

    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AdminStateProvider>
                        {children}
                    </AdminStateProvider>
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
