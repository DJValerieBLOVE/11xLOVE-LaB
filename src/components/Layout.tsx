import { Link, useLocation } from 'react-router-dom';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useZapStats } from '@/hooks/useZapStats';
import { LoginArea } from '@/components/auth/LoginArea';
import { CompactEQVisualizer } from '@/components/EQVisualizer';
import { BookOpen, Users, User, Settings, LogOut, Bell, Calendar, Rss, Target, Lock, MessageSquare, ArrowUp, ArrowDown } from 'lucide-react';
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
  const { user, metadata } = useCurrentUser();
  const logout = useLogout();
  const { zapsSent, zapsReceived } = useZapStats(user?.pubkey);

  // Format sats for display
  const formatSats = (sats: number): string => {
    if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
    if (sats >= 1000) return `${(sats / 1000).toFixed(1)}k`;
    return sats.toString();
  };

  const navigation = [
    { name: 'Big Dreams', href: '/big-dreams', icon: Target },
    { name: 'Experiments', href: '/experiments', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Tribe', href: '/tribe', icon: Users },
    { name: 'Love Board', href: '/love-board', icon: MessageSquare },
    { name: 'Vault', href: '/vault', icon: Lock },
    { name: 'Feed', href: '/feed', icon: Rss },
  ];

  // Mobile nav shows only 5 core items
  const mobileNav = [
    { name: 'Dreams', href: '/big-dreams', icon: Target },
    { name: 'Experiments', href: '/experiments', icon: BookOpen },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Vault', href: '/vault', icon: Lock },
    { name: 'Feed', href: '/feed', icon: Rss },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    // Special case: /experiment/* should highlight "Experiments" nav
    if (href === '/experiments' && location.pathname.startsWith('/experiment')) {
      return true;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop Left Sidebar - Reduced width for more content area */}
      <aside className="hidden md:flex md:w-52 md:flex-col md:fixed md:inset-y-0 border-r bg-background">
        {/* Logo - Links to Big Dreams */}
        <div className="flex h-16 items-center border-b px-6">
          <Link to="/big-dreams" className="flex items-center">
            <img src="/logo.png" alt="11x LOVE LaB" className="h-10" />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors rounded-lg ${
                  isActive(item.href)
                    ? 'text-[#6600ff] bg-purple-50'
                    : 'text-gray-600 hover:text-[#6600ff] hover:bg-purple-50/50'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area - Adjusted for narrower sidebar */}
      <div className="flex-1 md:pl-52">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 w-full border-b bg-background">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Mobile Logo (shows on mobile only) - Links to Big Dreams */}
            <Link to="/big-dreams" className="flex md:hidden items-center">
              <img src="/logo.png" alt="11x LOVE LaB" className="h-8" />
            </Link>

            {/* Desktop: EQ Visualizer */}
            <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-auto">
              <CompactEQVisualizer />
            </div>

            {/* Right side: Sats Stats, Notifications, User */}
            <div className="flex items-center space-x-2 md:space-x-3">
              {user ? (
                <>
                  {/* Sats Sent/Received Widget - Orange/Bitcoin color for both */}
                  <div className="hidden md:flex items-center gap-3 text-sm">
                    {/* Sent */}
                    <div className="flex items-center gap-1 text-orange-500" title={`${zapsSent.toLocaleString()} sats sent`}>
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-medium">{formatSats(zapsSent)}</span>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-4 w-px bg-gray-300" />
                    
                    {/* Received */}
                    <div className="flex items-center gap-1 text-orange-500" title={`${zapsReceived.toLocaleString()} sats received`}>
                      <ArrowDown className="h-4 w-4" />
                      <span className="font-medium">{formatSats(zapsReceived)}</span>
                    </div>
                  </div>

                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[#6600ff] relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 bg-[#6600ff] rounded-full"></span>
                  </Button>

                  {/* User Avatar Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-[#6600ff]/20 hover:ring-[#6600ff]/40 transition-all">
                        <AvatarImage src={metadata?.picture} alt={metadata?.display_name || metadata?.name || genUserName(user.pubkey)} />
                        <AvatarFallback className="bg-[#6600ff]/10 text-[#6600ff]">
                          {(metadata?.display_name || metadata?.name || genUserName(user.pubkey)).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {metadata?.display_name || metadata?.name || genUserName(user.pubkey)}
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
          {mobileNav.map((item) => {
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
