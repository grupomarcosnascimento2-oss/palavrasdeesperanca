// Envia um e-mail de aviso via Resend (https://resend.com) sempre que um
// pagamento é aprovado. Falhas aqui nunca devem derrubar o fluxo de
// pagamento — só registramos o erro no log.
export async function sendOrderApprovedEmail(pedido: {
  nome: string;
  email: string;
  telefone: string | null;
  entrega: string;
  paymentType: string;
  valor: number;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
}) {
  try {
    const apiKey = process.env["RESEND_API_KEY"];
    const notifyEmail = process.env["NOTIFY_EMAIL"];
    if (!apiKey || !notifyEmail) {
      console.error("RESEND_API_KEY / NOTIFY_EMAIL não configurados — aviso de pedido não enviado.");
      return;
    }

    const entregaLabel = pedido.entrega === "correio" ? "Pelo Correio" : "Retirada no lançamento";
    const enderecoHtml =
      pedido.entrega === "correio"
        ? `<p><strong>Endereço:</strong> ${pedido.rua}, ${pedido.numero}${pedido.complemento ? ` — ${pedido.complemento}` : ""}<br/>
           ${pedido.bairro} — ${pedido.cidade}/${pedido.uf}<br/>CEP: ${pedido.cep}</p>`
        : "";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Pedidos <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: `💰 Novo pedido aprovado — ${pedido.nome} (R$ ${pedido.valor.toFixed(2).replace(".", ",")})`,
        html: `
          <h2>Novo pedido aprovado!</h2>
          <p><strong>Nome:</strong> ${pedido.nome}</p>
          <p><strong>E-mail:</strong> ${pedido.email}</p>
          <p><strong>Telefone:</strong> ${pedido.telefone ?? "-"}</p>
          <p><strong>Forma de entrega:</strong> ${entregaLabel}</p>
          <p><strong>Forma de pagamento:</strong> ${pedido.paymentType === "pix" ? "Pix" : "Cartão de crédito"}</p>
          <p><strong>Valor:</strong> R$ ${pedido.valor.toFixed(2).replace(".", ",")}</p>
          ${enderecoHtml}
        `,
      }),
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de aviso de pedido:", err);
  }
}
