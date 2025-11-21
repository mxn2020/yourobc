// src/components/App/Sidebar.tsx
import { useState, useMemo } from 'react';
import { User, Bell, LogOut, Shield, ChevronLeft, ChevronRight, BarChart3, Building, Globe } from 'lucide-react';
import { Link, useLocation, useParams } from '@tanstack/react-router';
import { useAuth } from '@/features/system/auth';
import { NotificationsDropdown, useUnreadCount, AuthenticatedNotifications } from '@/features/system/notifications';
import { NAVIGATION } from '@/config';
import { LanguageSwitcherDropdown } from '@/features/system/i18n/components';
import { defaultLocale } from '@/features/system/i18n';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const location = useLocation();
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  const { auth, profile, isAuthenticated, isAdmin, signOut } = useAuth();
  const { unreadCount, isLoading } = useUnreadCount();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // Check if we're in special sections
  const isInAdminSection = location.pathname.startsWith('/admin');
  const isInProjectsSection = location.pathname.startsWith('/projects');

  // Dynamically detect which addon section we're in based on config
  const addonSections = useMemo(() =>
    NAVIGATION.addons.reduce((acc, addon) => ({
      ...acc,
      [addon.id]: location.pathname.startsWith(addon.path)
    }), {} as Record<string, boolean>),
    [location.pathname]
  );

  // Check if in any addon section
  const isInAddonSection = Object.values(addonSections).some(Boolean);

  // Import navigation from config
  const navigationItems = NAVIGATION.dashboard;
  const adminNavigationItems = NAVIGATION.admin;
  const projectsNavigationItems = NAVIGATION.projects;

  // Determine current navigation items based on active section
  const currentNavItems = useMemo(() => {
    if (isInAdminSection && isAdmin) return adminNavigationItems;
    if (isInProjectsSection) return projectsNavigationItems;

    // Check for addon navigation
    const activeAddon = NAVIGATION.addons.find(addon => addonSections[addon.id]);
    if (activeAddon && NAVIGATION.addonNavigation[activeAddon.id]) {
      return NAVIGATION.addonNavigation[activeAddon.id];
    }

    return navigationItems;
  }, [isInAdminSection, isAdmin, isInProjectsSection, addonSections, navigationItems, adminNavigationItems, projectsNavigationItems]);

  // Addons list with active states from config
  const addons = useMemo(() =>
    NAVIGATION.addons.map(addon => ({
      ...addon,
      active: addonSections[addon.id] || false,
    })),
    [addonSections]
  );

  // Get current addon
  const currentAddon = addons.find(addon => addon.active);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'
      }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <Link
            to="/{-$locale}"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-lg text-white font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Geenius</span>
          </Link>
        )}

        {isCollapsed && (
          <Link
            to="/{-$locale}"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
            className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm mx-auto"
          >
            <span className="text-lg text-white font-bold">G</span>
          </Link>
        )}

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Section Indicators */}
      {isInAdminSection && isAdmin && !isCollapsed && (
        <div className="mx-2 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Admin Panel</span>
          </div>
        </div>
      )}
      {isInProjectsSection && !isCollapsed && (
        <div className="mx-2 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Projects System</span>
          </div>
        </div>
      )}
      {currentAddon && !isCollapsed && (() => {
        const IconComponent = currentAddon.icon;
        const colorClasses = {
          indigo: 'bg-indigo-50 border-indigo-200',
          purple: 'bg-purple-50 border-purple-200',
          emerald: 'bg-emerald-50 border-emerald-200',
          blue: 'bg-blue-50 border-blue-200',
          cyan: 'bg-cyan-50 border-cyan-200',
          violet: 'bg-violet-50 border-violet-200',
          amber: 'bg-amber-50 border-amber-200',
          teal: 'bg-teal-50 border-teal-200',
          rose: 'bg-rose-50 border-rose-200',
          orange: 'bg-orange-50 border-orange-200',
        };
        const iconColorClasses = {
          indigo: 'text-indigo-600',
          purple: 'text-purple-600',
          emerald: 'text-emerald-600',
          blue: 'text-blue-600',
          cyan: 'text-cyan-600',
          violet: 'text-violet-600',
          amber: 'text-amber-600',
          teal: 'text-teal-600',
          rose: 'text-rose-600',
          orange: 'text-orange-600',
        };
        const textColorClasses = {
          indigo: 'text-indigo-700',
          purple: 'text-purple-700',
          emerald: 'text-emerald-700',
          blue: 'text-blue-700',
          cyan: 'text-cyan-700',
          violet: 'text-violet-700',
          amber: 'text-amber-700',
          teal: 'text-teal-700',
          rose: 'text-rose-700',
          orange: 'text-orange-700',
        };
        const bgClasses = colorClasses[currentAddon.color as keyof typeof colorClasses];
        const iconClasses = iconColorClasses[currentAddon.color as keyof typeof iconColorClasses];
        const textClasses = textColorClasses[currentAddon.color as keyof typeof textColorClasses];
        return (
          <div className={`mx-2 mt-2 p-3 border rounded-lg ${bgClasses}`}>
            <div className="flex items-center space-x-2">
              <IconComponent className={`h-4 w-4 ${iconClasses}`} />
              <span className={`text-sm font-medium ${textClasses}`}>{currentAddon.name}</span>
            </div>
          </div>
        );
      })()}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {currentNavItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path ||
            (item.path === '/admin' && location.pathname === '/admin/');

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors group ${isActive
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <IconComponent className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                }`} />
              {!isCollapsed && (
                <span className="flex-1">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Section Toggles */}
      <div className="border-t border-gray-200 p-2 space-y-1">
        {/* Projects Toggle */}
        {isInProjectsSection ? (
          <Link
            to="/{-$locale}/dashboard"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
            className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Exit Projects System' : undefined}
          >
            <BarChart3 className={`h-5 w-5 text-gray-500 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="flex-1 text-sm font-medium text-gray-700">Exit Projects</span>
            )}
          </Link>
        ) : (
          <Link
            to="/{-$locale}/projects"
            params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
            className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors ${isCollapsed ? 'justify-center' : ''
              }`}
            title={isCollapsed ? 'Projects System' : undefined}
          >
            <Building className={`h-5 w-5 text-blue-600 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="flex-1 text-sm font-medium text-blue-700">Projects System</span>
            )}
          </Link>
        )}

        {/* Admin Toggle (for admins only) */}
        {isAdmin && (
          <>
            {isInAdminSection ? (
              <Link
                to="/{-$locale}/dashboard"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'justify-center' : ''
                  }`}
                title={isCollapsed ? 'Exit Admin Panel' : undefined}
              >
                <BarChart3 className={`h-5 w-5 text-gray-500 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-sm font-medium text-gray-700">Exit Admin</span>
                )}
              </Link>
            ) : (
              <Link
                to="/{-$locale}/admin"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''
                  }`}
                title={isCollapsed ? 'Admin Panel' : undefined}
              >
                <Shield className={`h-5 w-5 text-red-600 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <span className="flex-1 text-sm font-medium text-red-700">Admin Panel</span>
                )}
              </Link>
            )}
          </>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 p-2">
        {/* Language Switcher */}
        <div className="mb-2 relative">
          <button
            onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
            className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Change language' : undefined}
          >
            <Globe className={`h-5 w-5 text-gray-500 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && (
              <span className="flex-1 text-sm font-medium text-gray-700">Language</span>
            )}
          </button>
          <LanguageSwitcherDropdown
            isOpen={isLanguageDropdownOpen}
            onClose={() => setIsLanguageDropdownOpen(false)}
          />
        </div>

        {/* Notifications */}
        <AuthenticatedNotifications>
          <div className="relative mb-2">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`w-full flex items-center px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors relative ${isCollapsed ? 'justify-center' : ''
                }`}
              title={isCollapsed ? 'Notifications' : undefined}
            >
              <Bell className={`h-5 w-5 text-gray-500 ${isCollapsed ? '' : 'mr-3'}`} />
              {!isCollapsed && (
                <span className="flex-1 text-sm font-medium text-gray-700">Notifications</span>
              )}
              {unreadCount > 0 && (
                <div className={`absolute bg-red-500 rounded-full flex items-center justify-center ${isCollapsed ? 'w-4 h-4 -top-1 -right-1' : 'w-5 h-5 right-2'
                  }`}>
                  <span className="text-xs font-medium text-white">{unreadCount}</span>
                </div>
              )}
            </button>

            <NotificationsDropdown
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />
          </div>
        </AuthenticatedNotifications>

        {/* User Profile */}
        {isAuthenticated && auth && (
          <div className={`flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors ${isCollapsed ? 'flex-col space-y-2' : 'space-x-3'
            }`}>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              {(profile?.avatar || auth.image) ? (
                <img
                  src={(profile?.avatar || auth.image) || undefined}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-gray-600" />
              )}
            </div>

            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {profile?.name || auth.name || auth.email}
                </div>
                <div className="text-xs text-gray-500">
                  {profile?.role === 'superadmin' ? 'Super Admin' :
                    profile?.role === 'admin' ? 'Admin' :
                      profile?.role === 'moderator' ? 'Moderator' :
                        profile?.role === 'editor' ? 'Editor' :
                          profile?.role === 'analyst' ? 'Analyst' :
                            profile?.role === 'guest' ? 'Guest' : 'User'}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className={`p-1 rounded-md hover:bg-gray-200 transition-colors ${isCollapsed ? 'w-full flex justify-center' : ''
                }`}
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}