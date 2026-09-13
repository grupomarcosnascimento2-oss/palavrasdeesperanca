import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Anchor, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCheckoutPreference } from "@/lib/mercadopago-checkout";

const searchSchema = z.object({
  entrega: z.enum(["presencial", "correio"]).catch("presencial"),
});

export const Route = createFileRoute("/checkout")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Finalizar pré-lançamento | Quando a Saudade Permanece" }],
  }),
  component: CheckoutPage,
});

const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

function CheckoutPage() {
  const { entrega } = Route.useSearch();
  const price = entrega === "correio" ? "R$ 49,90" : "R$ 29,90";
  const priceNote =
    entrega === "correio" ? "Envio pelo Correio · frete grátis" : "Retirada no dia do lançamento";

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const comprador = { nome, email, telefone, cpf };
      const payload =
        entrega === "correio"
          ? { entrega, comprador, endereco: { cep, rua, numero, complemento, bairro, cidade, uf } }
          : { entrega, comprador };

      const { initPoint } = await createCheckoutPreference({ data: payload });
      window.location.href = initPoint;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar o pagamento. Tente novamente em instantes.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-ivory py-16 sm:py-24">
      <div className="section-shell mx-auto max-w-xl">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Pré-lançamento</p>
          <h1 className="mt-3 text-3xl text-navy sm:text-4xl">Só mais um passo para garantir seu exemplar</h1>
          <p className="mt-3 text-charcoal/70">
            {priceNote} · <span className="font-display text-xl text-gold">{price}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gold/30 bg-background p-6 shadow-lg sm:p-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1.5" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="telefone">WhatsApp / telefone</Label>
                <Input id="telefone" required placeholder="61999999999" value={telefone} onChange={(e) => setTelefone(e.target.value)} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input id="cpf" required placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {entrega === "correio" && (
            <div className="space-y-4 border-t border-gold/25 pt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gold">Endereço de entrega</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="cep">CEP</Label>
                  <Input id="cep" required placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="numero">Número</Label>
                  <Input id="numero" required value={numero} onChange={(e) => setNumero(e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="rua">Rua</Label>
                <Input id="rua" required value={rua} onChange={(e) => setRua(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="complemento">Complemento (opcional)</Label>
                <Input id="complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} className="mt-1.5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
                <div>
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input id="bairro" required value={bairro} onChange={(e) => setBairro(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input id="cidade" required value={cidade} onChange={(e) => setCidade(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="uf">UF</Label>
                  <Select required value={uf} onValueChange={setUf}>
                    <SelectTrigger id="uf" className="mt-1.5 w-20">
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {UFS.map((sigla) => (
                        <SelectItem key={sigla} value={sigla}>{sigla}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <Button type="submit" variant="gold" size="lg" disabled={submitting} className="h-13 w-full text-xs font-bold uppercase tracking-[0.12em]">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Anchor className="size-4" />}
            {submitting ? "Redirecionando para o pagamento…" : `Ir para o pagamento · ${price}`}
          </Button>
          <p className="text-center text-xs text-charcoal/60">
            {entrega === "presencial" ? "Pagamento via PIX." : "Pagamento via PIX ou cartão de crédito."} Você será redirecionado para o ambiente seguro do Mercado Pago.
          </p>
        </form>
      </div>
    </main>
  );
}
