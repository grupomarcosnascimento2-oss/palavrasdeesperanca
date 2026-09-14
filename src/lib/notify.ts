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
        ? `<tr><td style="padding:14px 0;border-top:1px solid #e5decf;">
             <p style="margin:0 0 4px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#C9A45C;font-weight:600;">Endereço de entrega</p>
             <p style="margin:0;font-size:15px;color:#0B1D2E;line-height:1.5;">
               ${pedido.rua}, ${pedido.numero}${pedido.complemento ? ` — ${pedido.complemento}` : ""}<br/>
               ${pedido.bairro} — ${pedido.cidade}/${pedido.uf}<br/>
               CEP: ${pedido.cep}
             </p>
           </td></tr>`
        : "";

    function row(label: string, value: string) {
      return `<tr>
        <td style="padding:9px 0;border-top:1px solid #e5decf;font-size:13px;color:#6b6355;width:40%;">${label}</td>
        <td style="padding:9px 0;border-top:1px solid #e5decf;font-size:15px;color:#0B1D2E;font-weight:600;text-align:right;">${value}</td>
      </tr>`;
    }

    const html = `
    <div style="background:#F4E8D0;padding:32px 16px;font-family:Georgia,'Times New Roman',serif;">
      <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#FBF7EF;border-radius:12px;overflow:hidden;border:1px solid #e5decf;">
        <tr><td style="background:#0B1D2E;padding:28px 32px;text-align:center;">
          <p style="margin:0;color:#C9A45C;font-size:11px;letter-spacing:.2em;text-transform:uppercase;">Coleção Âncora</p>
          <p style="margin:6px 0 0;color:#F4E8D0;font-size:20px;">Novo pedido garantido</p>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:15px;color:#0B1D2E;">Alguém acabou de garantir um exemplar de <em>Quando a Saudade Permanece</em>. 🎉</p>
          <table role="presentation" width="100%" style="border-collapse:collapse;">
            ${row("Nome", pedido.nome)}
            ${row("E-mail", pedido.email)}
            ${row("Telefone", pedido.telefone ?? "-")}
            ${row("Entrega", entregaLabel)}
            ${row("Pagamento", pedido.paymentType === "pix" ? "Pix" : "Cartão de crédito")}
            ${row("Valor", `R$ ${pedido.valor.toFixed(2).replace(".", ",")}`)}
            ${enderecoHtml}
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#0B1D2E;text-align:center;">
          <p style="margin:0;color:#F4E8D0;opacity:.7;font-size:11px;letter-spacing:.08em;">Palavras de esperança para os caminhos da vida</p>
        </td></tr>
      </table>
    </div>`;

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Coleção Âncora <onboarding@resend.dev>",
        to: [notifyEmail],
        subject: `💰 Novo pedido — ${pedido.nome} (R$ ${pedido.valor.toFixed(2).replace(".", ",")})`,
        html,
      }),
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de aviso de pedido:", err);
  }
}
