
'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth';

import {
  canAccessRoute,
  ROLE_DASHBOARDS,
} from '@/lib/permissions';

import { FullPageLoader } from './ui/Loading';

export function AuthGuard({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const allowed = Boolean(
    user &&
    canAccessRoute(user.role, pathname),
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      const next =
        pathname && pathname !== '/dashboard'
          ? `?next=${encodeURIComponent(pathname)}`
          : '';

      router.replace(`/login${next}`);
      return;
    }

    if (!allowed) {
      router.replace(
        ROLE_DASHBOARDS[user.role] ?? '/',
      );
    }
  }, [
    loading,
    user,
    pathname,
    router,
    allowed,
  ]);

  if (loading || (user && !allowed)) {
    return (
      <div className="min-h-screen bg-cream">
        <FullPageLoader />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
