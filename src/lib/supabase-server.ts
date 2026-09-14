import { createClient } from "@supabase/supabase-js";

// Cliente Supabase para uso EXCLUSIVO no servidor (dentro de server functions).
// Usa a service_role key, que ignora RLS — por isso nunca deve ser importado
// em código que roda no navegador.
export function getSupabaseServerClient() {
  const url = process.env["DB_SUPABASE_URL"];
  const serviceRoleKey = process.env["DB_SUPABASE_SECRET_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "DB_SUPABASE_URL / DB_SUPABASE_SECRET_KEY não configurados nas variáveis de ambiente do projeto.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
