import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Anchor, Check, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPaymentStatus } from "@/lib/mercadopago-checkout";

const searchSchema = z.object({
  paymentId: z.string(),
  entrega: z.enum(["presencial", "correio"]).catch("presencial"),
});

export const Route = createFileRoute("/pagamento")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Pagamento via Pix | Quando a Saudade Permanece" }],
  }),
  component: PaymentPage,
});

const PRICE_LABEL: Record<"presencial" | "correio", string> = {
  presencial: "R$ 29,90",
  correio: "R$ 49,90",
};

function PaymentPage() {
  const { paymentId, entrega } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [copied, setCopied] = useState(false);
  const qrCode = useSessionValue(`pix-qr-${paymentId}`);
  const qrCodeBase64 = useSessionValue(`pix-qr-img-${paymentId}`);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    async function poll() {
      try {
        const result = await getPaymentStatus({ data: { paymentId } });
        setStatus(result.status);
        if (result.status === "approved") {
          if (pollingRef.current) clearInterval(pollingRef.current);
          navigate({ to: "/pedido-confirmado", search: { status: "approved" } });
        } else if (result.status === "rejected" || result.status === "cancelled") {
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error(err);
      }
    }

    poll();
    pollingRef.current = setInterval(poll, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentId, navigate]);

  function handleCopy() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <main className="min-h-screen bg-ivory py-16 sm:py-24">
      <div className="section-shell mx-auto max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {entrega === "presencial" ? "Retirada no dia do lançamento" : "Envio pelo Correio"}
        </p>
        <h1 className="mt-3 text-3xl text-navy sm:text-4xl">Finalize seu pagamento</h1>
        <p className="mt-3 font-display text-2xl text-gold">{PRICE_LABEL[entrega]}</p>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-background p-6 shadow-lg sm:p-8">
          {status === "rejected" || status === "cancelled" ? (
            <p className="text-charcoal/80">
              O pagamento não pôde ser concluído. Nenhum valor foi cobrado — você pode tentar novamente.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-navy">Pague com Pix</p>

              {qrCodeBase64 && (
                <img
                  src={`data:image/png;base64,${qrCodeBase64}`}
                  alt="QR Code Pix"
                  className="mx-auto mt-5 size-52 rounded-lg border border-gold/20"
                />
              )}

              {qrCode && (
                <div className="mt-5 break-all rounded-lg border border-gold/20 bg-ivory p-3 text-left text-xs text-charcoal/70">
                  {qrCode}
                </div>
              )}

              <Button onClick={handleCopy} variant="gold" size="lg" className="mt-5 h-12 w-full text-xs font-bold uppercase tracking-[0.12em]">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiado!" : "Copiar Pix"}
              </Button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-charcoal/60">
                <Loader2 className="size-3.5 animate-spin" />
                Aguardando confirmação do pagamento…
              </div>

              <div className="mt-6 space-y-1 text-left text-sm leading-6 text-charcoal/70">
                <p className="font-semibold text-navy">Como pagar:</p>
                <p>1. Copie o código Pix acima.</p>
                <p>2. Abra o aplicativo do seu banco.</p>
                <p>3. Escolha Pix Copia e Cola e cole o código.</p>
                <p>4. Confira o valor de <strong>{PRICE_LABEL[entrega]}</strong> e confirme o pagamento.</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gold">
          <Anchor className="size-4" />
          <a href="/" className="underline-offset-4 hover:underline">Voltar para a página do livro</a>
        </div>
      </div>
    </main>
  );
}

// O qr_code/qr_code_base64 não são recolocados na URL (são grandes e sensíveis
// o bastante para não virar query string). Guardamos em sessionStorage no
// momento da criação do pagamento (ver checkout.tsx) e lemos aqui.
function useSessionValue(key: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(() => {
    setValue(sessionStorage.getItem(key));
  }, [key]);
  return value;
}
