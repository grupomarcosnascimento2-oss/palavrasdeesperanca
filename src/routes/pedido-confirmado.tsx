import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Anchor, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// O Mercado Pago acrescenta esses parâmetros na URL de retorno (back_urls).
const searchSchema = z.object({
  status: z.string().optional(),
  collection_status: z.string().optional(),
  payment_id: z.string().optional(),
});

export const Route = createFileRoute("/pedido-confirmado")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [{ title: "Seu pedido | Quando a Saudade Permanece" }],
  }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { status, collection_status } = Route.useSearch();
  const resolvedStatus = status ?? collection_status ?? "pending";

  const content = {
    approved: {
      icon: <CheckCircle2 className="size-14 text-gold" strokeWidth={1.3} />,
      title: "Pagamento confirmado!",
      body: "Seu exemplar de Quando a Saudade Permanece está garantido. Enviamos os detalhes para o seu e-mail e vamos te avisar sobre os próximos passos perto do lançamento oficial, em 17 de novembro de 2026, no Santuário Nossa Senhora das Graças, em Anápolis (GO).",
    },
    pending: {
      icon: <Clock className="size-14 text-gold" strokeWidth={1.3} />,
      title: "Pagamento em processamento",
      body: "Recebemos sua solicitação e estamos aguardando a confirmação do pagamento (comum em PIX ou boleto). Assim que for aprovado, você receberá a confirmação por e-mail.",
    },
    rejected: {
      icon: <XCircle className="size-14 text-destructive" strokeWidth={1.3} />,
      title: "Não foi possível concluir o pagamento",
      body: "Algo deu errado com o pagamento. Nenhum valor foi cobrado. Você pode tentar novamente ou falar com a gente pelo WhatsApp.",
    },
  } as const;

  const view = content[resolvedStatus as keyof typeof content] ?? content.pending;

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-6 py-24 text-center text-ivory">
      <div className="max-w-lg">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gold/10">{view.icon}</div>
        <h1 className="mt-8 text-3xl sm:text-4xl">{view.title}</h1>
        <p className="mt-5 leading-7 text-ivory/80">{view.body}</p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {resolvedStatus === "rejected" ? (
            <Button asChild variant="gold" size="lg" className="h-13 w-full text-xs uppercase tracking-[0.12em] sm:w-auto">
              <Link to="/checkout">
                <Anchor className="size-4" /> Tentar novamente
              </Link>
            </Button>
          ) : (
            <Button asChild variant="gold" size="lg" className="h-13 w-full text-xs uppercase tracking-[0.12em] sm:w-auto">
              <Link to="/">
                <Anchor className="size-4" /> Voltar ao início
              </Link>
            </Button>
          )}
          <a href="https://wa.me/556191119324" target="_blank" rel="noreferrer" className="text-sm text-gold underline-offset-4 hover:underline">
            Falar com Padre Wesley
          </a>
        </div>
      </div>
    </main>
  );
}
