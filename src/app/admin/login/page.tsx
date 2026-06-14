import { LoginPageContent } from "@/components/admin/LoginPageContent";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;

  return (
    <LoginPageContent
      supabaseConfigured={isSupabaseConfigured()}
      supabaseUrl={getSupabaseUrl()}
      supabaseAnonKey={getSupabaseAnonKey()}
      error={error}
    />
  );
}
