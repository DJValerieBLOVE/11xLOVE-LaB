import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoginArea } from '@/components/auth/LoginArea';
import { Home, BookOpen, Users, CheckSquare, User, Settings, LogOut, Mail, Bell, Coins, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { genUserName } from '@/lib/genUserName';
import { useLogout } from '@/hooks/useLogout';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user } = useCurrentUser();
  const logout = useLogout();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Experiments', href: '/experiments', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Tribe', href: '/tribe', icon: Users },
    { name: 'Tracker', href: '/tracker', icon: CheckSquare },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        {/* Logo */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="11x LOVE LaB" className="h-10" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'text-[#6600ff]'
                    : 'text-gray-600 hover:text-[#6600ff]'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile Logo (shows on mobile only) */}
            <Link to="/" className="flex md:hidden items-center">
              <img src="/logo.png" alt="11x LOVE LaB" className="h-8" />
            </Link>

            {/* Desktop: Empty spacer */}
            <div className="hidden md:block"></div>

            {/* Right side: Mail, Notifications, Sats, User */}
            <div className="flex items-center space-x-3">
              {user ? (
                <>
                  {/* Sats Balance */}
                  <Button variant="ghost" className="text-[#ff9500] hover:text-[#ff9500] hidden md:flex items-center gap-1 bg-[#fff4e6] hover:bg-[#ffe8cc] rounded-full px-4">
                    <Coins className="h-4 w-4" />
                    <span className="font-medium">1</span>
                    <span className="text-sm">Sats</span>
                  </Button>

                  {/* Mail */}
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#6600ff]">
                    <Mail className="h-5 w-5" />
                  </Button>

                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#6600ff] relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-[#6600ff] rounded-full"></span>
                  </Button>

                  {/* User Avatar Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#6600ff]/20 hover:ring-[#6600ff]/40 transition-all">
                        <AvatarImage src={user.metadata?.picture} alt={user.metadata?.name || genUserName(user.pubkey)} />
                        <AvatarFallback className="bg-[#6600ff]/10 text-[#6600ff]">
                          {(user.metadata?.name || genUserName(user.pubkey)).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.metadata?.name || genUserName(user.pubkey)}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.pubkey.slice(0, 8)}...{user.pubkey.slice(-8)}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <LoginArea className="max-w-60" />
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
        <div className="grid grid-cols-5 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  isActive(item.href) ? 'text-[#6600ff]' : 'text-gray-400'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
