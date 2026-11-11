import { createServerFn } from "@tanstack/react-start";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import { sendOrderApprovedEmail, sendOrderApprovedWhatsApp } from "@/lib/notify";

// Preços do pré-lançamento. Fonte da verdade no servidor: o valor gravado
// nunca depende do que o cliente enviou pelo formulário.
const PRICES = {
  presencial: 29.9,
  correio: 49.9,
} as const;

const buyerSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  telefone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10 || v.length === 11, "Informe um telefone válido, com DDD"),
});

const enderecoSchema = z.object({
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP inválido: informe os 8 números do CEP (ex.: 75690000)"),
  rua: z.string().min(2, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro"),
  cidade: z.string().min(2, "Informe a cidade"),
  uf: z.string().length(2, "UF inválida"),
});

const pedidoInputSchema = z.discriminatedUnion("entrega", [
  z.object({ entrega: z.literal("presencial"), comprador: buyerSchema }),
  z.object({ entrega: z.literal("correio"), comprador: buyerSchema, endereco: enderecoSchema }),
]);

// Registra o pedido como "pending" (aguardando pagamento via Pix manual) e
// avisa por e-mail. A confirmação do pagamento é feita à mão na página /admin.
export const createPedido = createServerFn({ method: "POST" })
  .validator((input: unknown) => pedidoInputSchema.parse(input))
  .handler(async ({ data }) => {
    const valor = PRICES[data.entrega];
    const endereco = data.entrega === "correio" ? data.endereco : null;
    const supabase = getSupabaseServerClient();

    const record = {
      payment_id: `manual-${randomUUID()}`,
      payment_type: "pix_manual",
      status: "pending",
      entrega: data.entrega,
      valor,
      nome: data.comprador.nome,
      email: data.comprador.email,
      telefone: data.comprador.telefone,
      cep: endereco?.cep ?? null,
      rua: endereco?.rua ?? null,
      numero: endereco?.numero ?? null,
      complemento: endereco?.complemento ?? null,
      bairro: endereco?.bairro ?? null,
      cidade: endereco?.cidade ?? null,
      uf: endereco?.uf ?? null,
    };

    const { error } = await supabase.from("pedidos").insert(record);
    if (error) {
      console.error("Falha ao gravar pedido:", error);
      throw new Error("Não foi possível registrar seu pedido agora. Tente novamente em instantes.");
    }

    await Promise.all([
      sendOrderApprovedEmail({
        nome: record.nome,
        email: record.email,
        telefone: record.telefone,
        entrega: record.entrega,
        paymentType: record.payment_type,
        valor,
        cep: record.cep,
        rua: record.rua,
        numero: record.numero,
        complemento: record.complemento,
        bairro: record.bairro,
        cidade: record.cidade,
        uf: record.uf,
      }),
      sendOrderApprovedWhatsApp({
        nome: record.nome,
        telefone: record.telefone,
        entrega: record.entrega,
        paymentType: record.payment_type,
        valor,
      }),
    ]);

    return { entrega: data.entrega, valor };
  });

// ---- Área administrativa (lista de pedidos protegida por senha) -----------

function assertAdmin(password: string) {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) throw new Error("ADMIN_PASSWORD não configurada nas variáveis de ambiente do projeto.");
  if (password !== expected) throw new Error("Senha incorreta.");
}

export type PedidoRow = {
  id: string;
  created_at: string;
  status: string;
  entrega: string;
  valor: number;
  nome: string;
  email: string;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
};

export const listPedidos = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ password: z.string() }).parse(input))
  .handler(async ({ data }): Promise<PedidoRow[]> => {
    assertAdmin(data.password);
    const { data: rows, error } = await getSupabaseServerClient()
      .from("pedidos")
      .select("id, created_at, status, entrega, valor, nome, email, telefone, cep, rua, numero, complemento, bairro, cidade, uf")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Falha ao carregar os pedidos.");
    return (rows ?? []) as PedidoRow[];
  });

export const setPedidoStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) =>
    z
      .object({ password: z.string(), id: z.string().min(1), status: z.enum(["pending", "approved", "cancelled"]) })
      .parse(input),
  )
  .handler(async ({ data }) => {
    assertAdmin(data.password);
    const { error } = await getSupabaseServerClient()
      .from("pedidos")
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("Falha ao atualizar o pedido.");
    return { ok: true };
  });
