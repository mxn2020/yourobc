// src/components/app/Header.tsx

import { useState, useMemo } from 'react';
import { User, Search, Plus, LogOut, Shield, ChevronDown, Building, ListTodo, Users, CalendarDays, BarChart3, Globe } from 'lucide-react';
import { Link, useLocation, useParams } from '@tanstack/react-router';
import { useAuth } from '@/features/boilerplate/auth';
import { AuthenticatedNotifications } from '@/features/boilerplate/notifications';
import { NotificationBell } from './NotificationBell';
import { NAVIGATION } from '@/config';
import { LanguageSwitcherDropdown } from '@/features/boilerplate/i18n/components';
import { defaultLocale } from '@/features/boilerplate/i18n';

export function Header() {
  const location = useLocation();
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  const { auth, profile, isAuthenticated, isAdmin, signOut } = useAuth();
  // Notification state removed - now handled inside NotificationBell component
  const [isProjectsDropdownOpen, setIsProjectsDropdownOpen] = useState(false);
  const [isSupportingDropdownOpen, setIsSupportingDropdownOpen] = useState(false);
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

  // Addons list with active states
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Link
                to="/{-$locale}"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-xl text-white font-bold">G</span>
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">Geenius</span>
              </Link>
            </div>

            {/* Section Indicators */}
            {isInAdminSection && isAdmin && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Admin Panel</span>
              </div>
            )}
            {isInProjectsSection && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <Building className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Projects System</span>
              </div>
            )}
            {currentAddon && (
              (() => {
                const IconComponent = currentAddon.icon;
                const colorClasses = {
                  indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
                  purple: 'bg-purple-50 border-purple-200 text-purple-600',
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-600',
                  blue: 'bg-blue-50 border-blue-200 text-blue-600',
                  cyan: 'bg-cyan-50 border-cyan-200 text-cyan-600',
                  violet: 'bg-violet-50 border-violet-200 text-violet-600',
                  amber: 'bg-amber-50 border-amber-200 text-amber-600',
                  teal: 'bg-teal-50 border-teal-200 text-teal-600',
                  rose: 'bg-rose-50 border-rose-200 text-rose-600',
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
                };
                const bgClasses = colorClasses[currentAddon.color as keyof typeof colorClasses];
                const textClasses = textColorClasses[currentAddon.color as keyof typeof textColorClasses];
                return (
                  <div className={`flex items-center space-x-2 px-3 py-1 border rounded-lg ${bgClasses}`}>
                    <IconComponent className="h-4 w-4" />
                    <span className={`text-sm font-medium ${textClasses}`}>{currentAddon.name}</span>
                  </div>
                );
              })()
            )}

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1 ml-8">
              {currentNavItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/admin' && location.pathname === '/admin/');

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex flex-col items-center ${isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    <IconComponent className="h-4 w-4 mb-1" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Section Toggles */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0">
              {/* Projects Modules Dropdown - Shown when in Projects section */}
              {isInProjectsSection && (
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsProjectsDropdownOpen(!isProjectsDropdownOpen);
                      setIsSupportingDropdownOpen(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <Building className="h-4 w-4" />
                      <span className="text-xs">Projects Modules</span>
                    </div>
                    <ChevronDown className={`h-3 w-3 text-blue-400 transition-transform flex-shrink-0 ${isProjectsDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  {isProjectsDropdownOpen && (
                    <div className="absolute top-full mt-2 right-0 py-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-[100]">
                      <Link
                        to="/{-$locale}/projects/tasks"
                        params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                        onClick={() => setIsProjectsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <ListTodo className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Tasks</span>
                      </Link>
                      <Link
                        to="/{-$locale}/projects/team"
                        params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                        onClick={() => setIsProjectsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Team</span>
                      </Link>
                      <Link
                        to="/{-$locale}/projects/timeline"
                        params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                        onClick={() => setIsProjectsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-2 hover:bg-blue-50 transition-colors"
                      >
                        <CalendarDays className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Timeline</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Toggle */}
              {isInProjectsSection ? (
                <Link
                  to="/{-$locale}/dashboard"
                  params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                  className="flex flex-col items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <BarChart3 className="h-4 w-4 mb-1" />
                  <span>Exit Projects</span>
                </Link>
              ) : (
                <Link
                  to="/{-$locale}/projects"
                  params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                  className="flex flex-col items-center px-3 py-2 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Building className="h-4 w-4 mb-1" />
                  <span>Projects System</span>
                </Link>
              )}

              {/* Admin Toggle (for admins only) */}
              {isAdmin && (
                <>
                  {isInAdminSection ? (
                    <Link
                      to="/{-$locale}/dashboard"
                      params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                      className="flex flex-col items-center px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <BarChart3 className="h-4 w-4 mb-1" />
                      <span>Exit Admin</span>
                    </Link>
                  ) : (
                    <Link
                      to="/{-$locale}/admin"
                      params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                      className="flex flex-col items-center px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Shield className="h-4 w-4 mb-1" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                </>
              )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-6 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={
                  isInAdminSection ? "Search users and logs..." :
                  isInProjectsSection ? "Search customers and Projects data..." :
                  addonSections['chatbot'] ? "Search chat sessions..." :
                  addonSections['prompts'] ? "Search prompts and components..." :
                  addonSections['stories'] ? "Search stories and characters..." :
                  addonSections['geenius'] ? "Search projects and plugins..." :
                  addonSections['advanced-workflows'] ? "Search workflows..." :
                  addonSections['claude-workflows'] ? "Search workflows..." :
                  addonSections['content-manager'] ? "Search content and series..." :
                  addonSections['ai-academy'] ? "Search courses and students..." :
                  addonSections['wargame'] ? "Search cities and battles..." :
                  "Search projects and activities..."
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-gray-400 text-gray-900"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <AuthenticatedNotifications>
              <NotificationBell />
            </AuthenticatedNotifications>

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                title="Change language"
              >
                <Globe className="h-5 w-5" />
              </button>
              <LanguageSwitcherDropdown
                isOpen={isLanguageDropdownOpen}
                onClose={() => setIsLanguageDropdownOpen(false)}
              />
            </div>

            {!isInAdminSection && (
              <Link
                to="/{-$locale}/projects/new"
                params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex flex-col items-center transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mb-1" />
                <span className="text-xs">New Project</span>
              </Link>
            )}

            {isAuthenticated && auth && (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
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
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
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
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <nav className="flex justify-around py-2">
          {currentNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/admin' && location.pathname === '/admin/');

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center py-3 px-4 rounded-lg transition-colors ${isActive
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-gray-600'
                  }`}
              >
                <IconComponent className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Section Toggles */}
        <div className="border-t border-gray-200 px-4 py-2 space-y-2">
          {/* Projects Toggle */}
          {isInProjectsSection ? (
            <Link
              to="/{-$locale}/dashboard"
              params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
              className="flex items-center justify-center space-x-2 w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Exit Projects System</span>
            </Link>
          ) : (
            <Link
              to="/{-$locale}/projects"
              params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
              className="flex items-center justify-center space-x-2 w-full py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Building className="h-4 w-4" />
              <span>Projects System</span>
            </Link>
          )}

          {/* Admin Toggle (for admins only) */}
          {isAdmin && (
            <>
              {isInAdminSection ? (
                <Link
                  to="/{-$locale}/dashboard"
                  params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                  className="flex items-center justify-center space-x-2 w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Exit Admin Panel</span>
                </Link>
              ) : (
                <Link
                  to="/{-$locale}/admin"
                  params={{ locale: currentLocale === defaultLocale ? undefined : currentLocale }}
                  className="flex items-center justify-center space-x-2 w-full py-2 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

