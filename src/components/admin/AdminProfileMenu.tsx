"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RoleBadge } from "@/components/admin/RoleBadge";
import { signOut } from "@/lib/admin/actions";
import { APP_DEVELOPER } from "@/lib/app-version";

function getInitials(name: string | null, email: string) {
  const source = name?.trim() || email;
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

type AdminProfileMenuProps = {
  profile: {
    email: string;
    display_name: string | null;
    role_name: string;
    badge_color: string;
  };
};

export function AdminProfileMenu({ profile }: AdminProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const displayName = profile.display_name ?? profile.email;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="dash-profile-menu" ref={rootRef}>
      <button
        type="button"
        className="dash-profile-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="dash-profile-avatar" aria-hidden>
          {getInitials(profile.display_name, profile.email)}
        </span>
        <span className="dash-profile-meta">
          <span className="dash-profile-name">{displayName}</span>
          <span className="dash-profile-dev">Developer · {APP_DEVELOPER}</span>
        </span>
        <span className="dash-profile-chevron" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div className="dash-profile-dropdown" role="menu">
          <div className="dash-profile-dropdown-head">
            <p className="dash-profile-dropdown-name">{displayName}</p>
            <p className="dash-profile-dropdown-email" dir="ltr">
              {profile.email}
            </p>
            <RoleBadge
              label={profile.role_name}
              color={profile.badge_color}
              size="sm"
            />
          </div>
          <div className="dash-profile-dropdown-actions">
            <Link
              href="/admin/settings"
              className="dash-profile-dropdown-link"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Profile & Settings
            </Link>
            <Link
              href="/"
              className="dash-profile-dropdown-link"
              role="menuitem"
              target="_blank"
              onClick={() => setOpen(false)}
            >
              View Live Site
            </Link>
            <form action={signOut}>
              <button type="submit" className="dash-profile-dropdown-signout" role="menuitem">
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
