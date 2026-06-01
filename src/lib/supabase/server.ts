import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = NonNullable<Parameters<CookieStore["set"]>[0]>;

export async function createSupabaseServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, _options: CookieOptions) {
        try {
          void _options;
          cookieStore.set(name, value);
        } catch {
          // Ignore attempts to set cookies in Server Components.
        }
      },
      remove(name: string, _options: CookieOptions) {
        try {
          void _options;
          cookieStore.set(name, "");
        } catch {
          // Ignore attempts to remove cookies in Server Components.
        }
      }
    }
  });
}
