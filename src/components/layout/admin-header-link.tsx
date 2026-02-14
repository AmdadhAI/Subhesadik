'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AdminHeaderLinkProps {
  className?: string;
  onClick?: () => void;
}

export function AdminHeaderLink({ className, onClick }: AdminHeaderLinkProps) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const adminRoleRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'role_admin', user.uid);
    }, [firestore, user]);

    const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);
    const isAdmin = adminRole?.isAdmin === true;
    
    const isLoading = isUserLoading || (user && isAdminRoleLoading);

    if (isLoading || !isAdmin) {
        return null;
    }

    return (
        <Link href="/admin" className={cn("text-muted-foreground transition-colors hover:text-primary", className)} onClick={onClick}>
            Admin
        </Link>
    );
}
