import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Anchor, Check, Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PIX_KEY, PIX_QR_IMAGE, PIX_RECEBEDOR, WHATSAPP_COMPROVANTE } from "@/lib/pix-config";

const searchSchema = z.object({
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
  const { entrega } = Route.useSearch();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!PIX_KEY) return;
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  const whatsappHref = `https://wa.me/${WHATSAPP_COMPROVANTE}?text=${encodeURIComponent(
    `Olá! Fiz o pagamento via Pix (${PRICE_LABEL[entrega]}) do livro Quando a Saudade Permanece. Segue o comprovante.`,
  )}`;

  return (
    <main className="min-h-screen bg-ivory py-16 sm:py-24">
      <div className="section-shell mx-auto max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          {entrega === "presencial" ? "Retirada no dia do lançamento" : "Envio pelo Correio"}
        </p>
        <h1 className="mt-3 text-3xl text-navy sm:text-4xl">Pedido registrado!</h1>
        <p className="mt-2 text-charcoal/75">Falta só o pagamento. Pague com Pix e garanta seu exemplar.</p>
        <p className="mt-4 font-display text-2xl text-gold">{PRICE_LABEL[entrega]}</p>

        <div className="mt-8 rounded-2xl border border-gold/30 bg-background p-6 shadow-lg sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-navy">Pague com Pix</p>

          {PIX_QR_IMAGE && (
            <img src={PIX_QR_IMAGE} alt="QR Code Pix" className="mx-auto mt-5 size-56 rounded-lg border border-gold/20 object-contain" />
          )}

          {PIX_KEY ? (
            <>
              <p className="mt-5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/60">Chave Pix</p>
              <div className="mt-1.5 break-all rounded-lg border border-gold/20 bg-ivory p-3 text-left text-sm text-charcoal/80">{PIX_KEY}</div>
              {PIX_RECEBEDOR && <p className="mt-2 text-left text-xs text-charcoal/60">Favorecido: {PIX_RECEBEDOR}</p>}
              <Button onClick={handleCopy} variant="gold" size="lg" className="mt-5 h-12 w-full text-xs font-bold uppercase tracking-[0.12em]">
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copiado!" : "Copiar chave Pix"}
              </Button>
            </>
          ) : (
            <p className="mt-5 rounded-lg bg-ivory p-3 text-sm text-charcoal/70">
              {PIX_QR_IMAGE ? "Aponte a câmera do app do seu banco para o QR Code acima." : "A chave Pix será informada em breve."}
            </p>
          )}

          <div className="mt-6 space-y-1 text-left text-sm leading-6 text-charcoal/70">
            <p className="font-semibold text-navy">Como pagar:</p>
            <p>1. Abra o aplicativo do seu banco e escolha Pix.</p>
            <p>2. Escaneie o QR Code ou cole a chave copiada.</p>
            <p>3. Confira o valor de <strong>{PRICE_LABEL[entrega]}</strong> e confirme.</p>
            <p>4. Envie o comprovante pelo WhatsApp (botão abaixo).</p>
          </div>

          <Button asChild variant="goldOutline" size="lg" className="mt-6 h-12 w-full text-xs font-bold uppercase tracking-[0.12em]">
            <a href={whatsappHref} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> Enviar comprovante
            </a>
          </Button>
          <p className="mt-4 text-xs leading-5 text-charcoal/60">
            Seu pedido é confirmado por conferência manual do pagamento. Assim que for conferido, entraremos em contato.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gold">
          <Anchor className="size-4" />
          <Link to="/" className="underline-offset-4 hover:underline">Voltar para a página do livro</Link>
        </div>
      </div>
    </main>
  );
}
