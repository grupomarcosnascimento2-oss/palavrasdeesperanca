import { createClient } from "@supabase/supabase-js";

// Cliente Supabase para uso EXCLUSIVO no servidor (dentro de server functions).
// Usa a service_role key, que ignora RLS — por isso nunca deve ser importado
// em código que roda no navegador.
export function getSupabaseServerClient() {
  const url = process.env["SUPABASE_URL"];
  const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY não configurados nas variáveis de ambiente do projeto.",
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
