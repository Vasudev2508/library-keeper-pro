import { BookOpen, LayoutDashboard, Library, ArrowLeftRight, Bell, BarChart3, Users, LogOut, Settings, Shield, GraduationCap, BookMarked } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mainItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Books', url: '/books', icon: Library },
  { title: 'Transactions', url: '/transactions', icon: ArrowLeftRight },
  { title: 'Notifications', url: '/notifications', icon: Bell },
];

const librarianItems = [
  { title: 'Reports', url: '/reports', icon: BarChart3 },
];

const adminItems = [
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const { profile, roles, signOut, isStaff, hasRole } = useAuthStore();

  const primaryRole = roles[0] || 'student';
  const isActive = (path: string) => location.pathname === path;

  const managementItems = hasRole('admin') ? adminItems : hasRole('librarian') ? librarianItems : [];

  const roleIcon = () => {
    switch (primaryRole) {
      case 'admin': return <Shield className="w-3 h-3" />;
      case 'librarian': return <BookMarked className="w-3 h-3" />;
      case 'faculty': return <Users className="w-3 h-3" />;
      default: return <GraduationCap className="w-3 h-3" />;
    }
  };

  const roleColor = () => {
    switch (primaryRole) {
      case 'admin': return 'bg-rose-500/10 text-rose-500';
      case 'librarian': return 'bg-amber-500/10 text-amber-500';
      case 'faculty': return 'bg-emerald-500/10 text-emerald-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              {!collapsed && <span className="font-display font-bold">CSE Library</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {managementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>{!collapsed && 'Management'}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {managementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <Badge className={`${roleColor()} border-0 text-[10px] px-1.5 py-0 capitalize gap-1`}>
                {roleIcon()} {primaryRole}
              </Badge>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={signOut} className="shrink-0" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
