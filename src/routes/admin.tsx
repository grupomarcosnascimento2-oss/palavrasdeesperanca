import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPedidos, setPedidoStatus, type PedidoRow } from "@/lib/pedidos";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Pedidos" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPage,
});

const STATUS_LABEL: Record<string, string> = { pending: "Aguardando", approved: "Pago", cancelled: "Cancelado" };
type Filter = "all" | "pending" | "approved" | "cancelled";
const brl = (n: number) => `R$ ${Number(n).toFixed(2).replace(".", ",")}`;

function readStoredPassword() {
  try {
    return sessionStorage.getItem("admin-pw") ?? "";
  } catch {
    return "";
  }
}

function AdminPage() {
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [rows, setRows] = useState<PedidoRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const load = useCallback(async (pw: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPedidos({ data: { password: pw } });
      setRows(data);
      setLogged(true);
      try {
        sessionStorage.setItem("admin-pw", pw);
      } catch {
        /* ignora */
      }
    } catch (err) {
      setLogged(false);
      setError(err instanceof Error ? err.message : "Erro ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = readStoredPassword();
    if (stored) {
      setPassword(stored);
      void load(stored);
    }
  }, [load]);

  async function changeStatus(id: string, status: "pending" | "approved" | "cancelled") {
    setError(null);
    try {
      await setPedidoStatus({ data: { password, id, status } });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar.");
    }
  }

  if (!logged) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-navy px-6 text-ivory">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void load(password);
          }}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-gold/30 bg-navy-soft p-6"
        >
          <h1 className="text-2xl">Pedidos</h1>
          <Input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} className="border-gold/30 bg-navy text-ivory" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="gold" disabled={loading || !password} className="w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
          </Button>
        </form>
      </main>
    );
  }

  const paid = rows.filter((r) => r.status === "approved");
  const pending = rows.filter((r) => r.status === "pending");
  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const total = paid.reduce((sum, r) => sum + Number(r.valor), 0);

  return (
    <main className="min-h-screen bg-ivory px-4 py-10 text-charcoal">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="text-3xl text-navy">Pedidos</h1>
          <Button variant="goldOutline" size="sm" onClick={() => void load(password)} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Atualizar"}
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-gold/30 bg-background p-3"><p className="text-2xl text-navy">{paid.length}</p><p className="text-xs uppercase tracking-wider">Pagos</p></div>
          <div className="rounded-xl border border-gold/30 bg-background p-3"><p className="text-2xl text-navy">{pending.length}</p><p className="text-xs uppercase tracking-wider">Aguardando</p></div>
          <div className="rounded-xl border border-gold/30 bg-background p-3"><p className="text-2xl text-navy">{brl(total)}</p><p className="text-xs uppercase tracking-wider">Recebido</p></div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(["all", "pending", "approved", "cancelled"] as Filter[]).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full border px-4 py-1.5 text-sm ${filter === f ? "border-gold bg-gold/20 text-navy" : "border-gold/30"}`}>
              {f === "all" ? "Todos" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

        <div className="mt-6 space-y-3">
          {visible.length === 0 && <p className="text-sm text-charcoal/60">Nenhum pedido neste filtro.</p>}
          {visible.map((r) => (
            <div key={r.id} className="rounded-xl border border-gold/30 bg-background p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-navy">{r.nome}</p>
                  <p className="text-sm text-charcoal/70">{r.email} · {r.telefone ?? "-"}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-navy">{brl(r.valor)}</p>
                  <p className="text-xs text-charcoal/60">{new Date(r.created_at).toLocaleString("pt-BR")}</p>
                </div>
              </div>
              <p className="mt-2 text-sm">
                {r.entrega === "correio"
                  ? `Correio: ${r.rua}, ${r.numero}${r.complemento ? ` — ${r.complemento}` : ""} · ${r.bairro} · ${r.cidade}/${r.uf} · CEP ${r.cep}`
                  : "Retirada no lançamento"}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${r.status === "approved" ? "bg-green-100 text-green-800" : r.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"}`}>
                  {STATUS_LABEL[r.status] ?? r.status}
                </span>
                {r.status !== "approved" && <Button size="sm" variant="gold" onClick={() => void changeStatus(r.id, "approved")}>Marcar como pago</Button>}
                {r.status !== "pending" && <Button size="sm" variant="goldOutline" onClick={() => void changeStatus(r.id, "pending")}>Voltar p/ aguardando</Button>}
                {r.status !== "cancelled" && <Button size="sm" variant="goldOutline" onClick={() => void changeStatus(r.id, "cancelled")}>Cancelar</Button>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
