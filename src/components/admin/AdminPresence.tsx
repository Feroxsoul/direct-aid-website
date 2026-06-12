"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ROLE_LABELS, type AdminRole } from "@/lib/admin/roles";

type PresenceMeta = {
  email: string;
  role: AdminRole;
  display_name: string | null;
};

type OnlineAdmin = {
  key: string;
  email: string;
  role: AdminRole;
  displayName: string | null;
};

type AdminPresenceProps = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  currentUser: {
    key: string;
    email: string;
    role: AdminRole;
    displayName: string | null;
  };
};

function parsePresenceState(
  state: Record<string, PresenceMeta[]>,
): OnlineAdmin[] {
  const users: OnlineAdmin[] = [];

  for (const [key, presences] of Object.entries(state)) {
    const meta = presences[0];
    if (!meta?.email || !meta.role) continue;

    users.push({
      key,
      email: meta.email,
      role: meta.role,
      displayName: meta.display_name,
    });
  }

  return users.sort((a, b) => a.email.localeCompare(b.email));
}

export function AdminPresence({
  supabaseUrl,
  supabaseAnonKey,
  currentUser,
}: AdminPresenceProps) {
  const [online, setOnline] = useState<OnlineAdmin[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
    const channel = supabase.channel("admin-dashboard", {
      config: { presence: { key: currentUser.key } },
    });

    const updateOnline = () => {
      setOnline(parsePresenceState(channel.presenceState<PresenceMeta>()));
    };

    channel
      .on("presence", { event: "sync" }, updateOnline)
      .on("presence", { event: "join" }, updateOnline)
      .on("presence", { event: "leave" }, updateOnline)
      .subscribe(async (status) => {
        setConnected(status === "SUBSCRIBED");
        if (status === "SUBSCRIBED") {
          await channel.track({
            email: currentUser.email,
            role: currentUser.role,
            display_name: currentUser.displayName,
          });
          updateOnline();
        }
      });

    return () => {
      void channel.untrack();
      void supabase.removeChannel(channel);
    };
  }, [supabaseUrl, supabaseAnonKey, currentUser]);

  const countLabel = useMemo(() => {
    const count = online.length;
    if (count === 0) return connected ? "0 متصل" : "جاري الاتصال…";
    if (count === 1) return "1 متصل";
    return `${count} متصلين`;
  }, [connected, online.length]);

  return (
    <details className="admin-presence">
      <summary className="admin-presence-summary">
        <span
          className={`admin-presence-dot ${connected ? "is-live" : ""}`}
          aria-hidden
        />
        <span>{countLabel}</span>
      </summary>
      <div className="admin-presence-panel">
        <p className="admin-presence-title">المتصلون الآن في لوحة التحكم</p>
        {online.length === 0 ? (
          <p className="admin-presence-empty">
            {connected ? "لا يوجد أحد متصل حالياً" : "جاري تحميل قائمة المتصلين…"}
          </p>
        ) : (
          <ul className="admin-presence-list">
            {online.map((user) => {
              const isYou = user.key === currentUser.key;
              return (
                <li key={user.key} className="admin-presence-item">
                  <div className="admin-presence-user">
                    <span className="admin-presence-name">
                      {user.displayName ?? user.email}
                      {isYou ? " (أنت)" : null}
                    </span>
                    {user.displayName ? (
                      <span className="admin-presence-email" dir="ltr">
                        {user.email}
                      </span>
                    ) : null}
                  </div>
                  <span className={`admin-presence-role is-${user.role}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}
