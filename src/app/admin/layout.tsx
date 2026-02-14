'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase, useAuth } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard, ShoppingCart, Settings, LogOut, Package, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/categories", icon: Tag, label: "Categories" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/content", icon: Settings, label: "Content" },
];

function AdminNavLink({ href, children, isMobile = false }: { href: string; children: React.ReactNode, isMobile?: boolean }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
    
    if (isMobile) {
        return (
             <Link href={href} className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md text-xs w-full h-full",
                isActive ? "text-primary bg-muted" : "text-muted-foreground hover:bg-muted hover:text-primary"
            )}>
                {children}
            </Link>
        )
    }
    
    return (
        <Link href={href} className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            isActive && "bg-muted text-primary"
        )}>
            {children}
        </Link>
    )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const adminRoleRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'role_admin', user.uid);
  }, [firestore, user]);

  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
  const isAdmin = adminRole?.isAdmin === true;
  const isLoading = isUserLoading || (user && isAdminRoleLoading);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!isLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isLoading, user, router, pathname]);

  useEffect(() => {
      if (!isLoading && user && !isAdmin && pathname !== '/admin/login') {
          // If user is loaded, logged in, but not an admin, they are forbidden from admin pages.
      } else if (!isLoading && user && isAdmin && pathname === '/admin/login') {
          // If a logged-in admin lands on the login page, redirect them to the dashboard.
          router.replace('/admin');
      }
  }, [isLoading, user, isAdmin, pathname, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <>{isLoading ? <div className="flex h-screen w-full items-center justify-center">Loading...</div> : children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-xl text-muted-foreground animate-pulse">Loading Admin Panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-background">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button onClick={handleLogout} variant="link" className="mt-4">Login as a different user</Button>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/admin" className="flex items-center gap-2 font-semibold">
              <span className="font-headline text-primary">Subhe Sadik Admin</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map(item => (
                  <AdminNavLink key={item.href} href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                  </AdminNavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Button onClick={handleLogout} size="sm" variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-40">
            <div className="w-full flex-1">
                 <Link href="/admin" className="flex items-center gap-2 font-semibold md:hidden">
                    <span className="font-headline text-primary">Subhe Sadik Admin</span>
                </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              {user?.email}
            </div>
             <div className="md:hidden">
                <Button onClick={handleLogout} size="icon" variant="ghost">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20 md:pb-6">
            {children}
          </main>
      </div>

       {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <nav className="grid grid-cols-6 items-center justify-center gap-1 p-1">
            {navItems.map(item => (
                <AdminNavLink key={item.href} href={item.href} isMobile={true}>
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                </AdminNavLink>
            ))}
        </nav>
      </div>
    </div>
  );
}
