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
    // Aceita múltiplos e-mails separados por vírgula no mesmo secret.
    const notifyEmails = notifyEmail.split(",").map((e) => e.trim()).filter(Boolean);

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
        to: notifyEmails,
        subject: `💰 Novo pedido — ${pedido.nome} (R$ ${pedido.valor.toFixed(2).replace(".", ",")})`,
        html,
      }),
    });
  } catch (err) {
    console.error("Falha ao enviar e-mail de aviso de pedido:", err);
  }
}

// Envia um aviso por WhatsApp via Meta WhatsApp Cloud API, sempre que um
// pagamento for aprovado. Preparado para ser ativado depois — enquanto os
// secrets abaixo não forem configurados, a função simplesmente não faz nada
// (não quebra o fluxo de pagamento).
//
// Configuração necessária (Cloud > Secrets no Lovable), quando formos ativar:
// - WHATSAPP_ACCESS_TOKEN     → token de acesso do app Meta (permanente, gerado
//                                em Meta for Developers > seu app > WhatsApp > API Setup)
// - WHATSAPP_PHONE_NUMBER_ID  → o "Phone number ID" do número comercial
//                                (mesmo painel, aparece junto do número de teste/produção)
// - WHATSAPP_NOTIFY_NUMBERS   → um ou mais números que devem RECEBER o aviso,
//                                separados por vírgula, em formato internacional
//                                sem "+" nem espaços (ex: 5561999119324)
// - WHATSAPP_TEMPLATE_NAME    → (opcional) nome de um template aprovado no Meta,
//                                se quiser enviar fora da janela de 24h. Sem isso,
//                                envia como mensagem de texto simples (só funciona
//                                se o número de destino tiver iniciado conversa com
//                                o número comercial nas últimas 24h).
export async function sendOrderApprovedWhatsApp(pedido: {
  nome: string;
  telefone: string | null;
  entrega: string;
  paymentType: string;
  valor: number;
}) {
  try {
    const accessToken = process.env["WHATSAPP_ACCESS_TOKEN"];
    const phoneNumberId = process.env["WHATSAPP_PHONE_NUMBER_ID"];
    const notifyNumbers = process.env["WHATSAPP_NOTIFY_NUMBERS"];
    const templateName = process.env["WHATSAPP_TEMPLATE_NAME"];

    if (!accessToken || !phoneNumberId || !notifyNumbers) {
      // Ainda não configurado — sai em silêncio (sem log de erro), já que
      // esse canal é opcional até ser ativado de propósito.
      return;
    }

    const destinatarios = notifyNumbers.split(",").map((n) => n.trim()).filter(Boolean);
    const entregaLabel = pedido.entrega === "correio" ? "pelo Correio" : "retirada no lançamento";
    const pagamentoLabel = pedido.paymentType === "pix" ? "Pix" : "cartão de crédito";
    const valorLabel = `R$ ${pedido.valor.toFixed(2).replace(".", ",")}`;

    const texto =
      `📖 *Novo pedido — Quando a Saudade Permanece*\n\n` +
      `*Nome:* ${pedido.nome}\n` +
      `*Telefone:* ${pedido.telefone ?? "-"}\n` +
      `*Entrega:* ${entregaLabel}\n` +
      `*Pagamento:* ${pagamentoLabel}\n` +
      `*Valor:* ${valorLabel}`;

    await Promise.all(
      destinatarios.map((to) =>
        fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            templateName
              ? {
                  messaging_product: "whatsapp",
                  to,
                  type: "template",
                  template: {
                    name: templateName,
                    language: { code: "pt_BR" },
                    components: [
                      {
                        type: "body",
                        parameters: [
                          { type: "text", text: pedido.nome },
                          { type: "text", text: entregaLabel },
                          { type: "text", text: pagamentoLabel },
                          { type: "text", text: valorLabel },
                        ],
                      },
                    ],
                  },
                }
              : {
                  messaging_product: "whatsapp",
                  to,
                  type: "text",
                  text: { body: texto },
                },
          ),
        }),
      ),
    );
  } catch (err) {
    console.error("Falha ao enviar aviso de pedido via WhatsApp:", err);
  }
}
