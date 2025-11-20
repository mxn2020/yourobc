// src/components/app/AppLayout.tsx

import { useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useAuth } from '@/features/system/auth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface Props {
    children: React.ReactNode;
}

export function AppLayout({ children }: Props) {
    const location = useLocation();
    const { settings, isAuthenticated } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const isAuthRoute = location.pathname.startsWith('/auth/');

    // Default to header layout if not authenticated, on auth routes, or no settings
    const layoutPreference = settings?.layoutPreferences.layout || 'header';

    // Always use header layout for auth routes
    if (isAuthRoute) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main>
                    {children}
                </main>
            </div>
        );
    }

    // Skip auth loading check - let routes handle their own loading states
    // This prevents duplicate loading spinners and allows for more granular control

    // If not authenticated, show a simple layout
    // Auth protection is handled by route guards in _protected.tsx
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50">
                <main>
                    {children}
                </main>
            </div>
        );
    }

    // Use sidebar layout if user prefers it
    if (layoutPreference === 'sidebar') {
        return (
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar 
                    isCollapsed={sidebarCollapsed}
                    onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
                <div className="flex-1 flex flex-col">
                    {/* Optional top bar for sidebar layout */}
                    <div className="bg-white border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                {/* Breadcrumbs or page title could go here */}
                            </div>
                            {/* Search or quick actions could go here */}
                        </div>
                    </div>
                    <main className="flex-1 p-6 overflow-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Default header layout
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
                {children}
            </main>
        </div>
    );
}

// Hook to get current layout preference with caching
export function useLayoutPreference() {
    const { settings, isAuthenticated, isSettingsLoading } = useAuth();
    
    return {
        layoutPreference: settings?.layoutPreferences.layout || 'header',
        isLoading: isAuthenticated && isSettingsLoading,
        isAuthenticated,
    };
}