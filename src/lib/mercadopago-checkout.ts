import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import { randomUUID } from "node:crypto";
import { z } from "zod";

// Preços do pré-lançamento. Mantidos aqui (servidor) como fonte da verdade,
// para que o valor cobrado nunca dependa do que o cliente enviou pelo formulário.
const PRICES = {
  presencial: 29.9,
  correio: 49.9,
} as const;

const buyerSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().min(10, "Informe um telefone válido"),
  cpf: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 11, "CPF inválido"),
});

const enderecoSchema = z.object({
  cep: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 8, "CEP inválido"),
  rua: z.string().min(2, "Informe a rua"),
  numero: z.string().min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Informe o bairro"),
  cidade: z.string().min(2, "Informe a cidade"),
  uf: z.string().length(2, "UF inválida"),
});

const checkoutInputSchema = z.discriminatedUnion("entrega", [
  z.object({ entrega: z.literal("presencial"), comprador: buyerSchema }),
  z.object({ entrega: z.literal("correio"), comprador: buyerSchema, endereco: enderecoSchema }),
]);

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

// Esta preferência (Checkout Pro) agora é usada apenas para o pagamento com
// CARTÃO DE CRÉDITO (opção disponível só para entrega=correio). O PIX passou a
// ser gerado diretamente na nossa página via Payments API (ver
// createPixPayment), para evitar o checkout hospedado do Mercado Pago — onde
// o botão "Criar Pix" ficou instável em testes.
const ALL_NON_CARD_TYPES = ["bank_transfer", "debit_card", "prepaid_card", "ticket", "atm"];

function getBaseUrl() {
  // Configure SITE_URL nas variáveis de ambiente com a URL pública final do site
  // (ex: https://palavrasdeesperanca.lovable.app). Sem isso os retornos do
  // Mercado Pago (back_urls) não vão funcionar corretamente em produção.
  return process.env["SITE_URL"] ?? "https://palavrasdeesperanca.lovable.app";
}

export const createCheckoutPreference = createServerFn({ method: "POST" })
  .validator((input: unknown) => checkoutInputSchema.parse(input))
  .handler(async ({ data }) => {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente do projeto.",
      );
    }

    const price = PRICES[data.entrega];
    const baseUrl = getBaseUrl();
    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    const [nomeFirst, ...nomeRest] = data.comprador.nome.trim().split(/\s+/);
    const sobrenome = nomeRest.join(" ");

    const result = await preference.create({
      body: {
        items: [
          {
            id: "quando-a-saudade-permanece",
            title: "Quando a Saudade Permanece — Pe. Wesley Xavier Ramos",
            description:
              data.entrega === "presencial"
                ? "Pré-lançamento · retirada presencial no lançamento oficial"
                : "Pré-lançamento · envio pelo Correio (frete grátis)",
            quantity: 1,
            unit_price: price,
            currency_id: "BRL",
          },
        ],
        payer: {
          name: nomeFirst ?? data.comprador.nome,
          ...(sobrenome ? { surname: sobrenome } : {}),
          email: data.comprador.email,
          phone: { area_code: data.comprador.telefone.slice(0, 2), number: data.comprador.telefone.slice(2) },
          identification: { type: "CPF", number: data.comprador.cpf },
          ...(data.entrega === "correio"
            ? {
                address: {
                  zip_code: data.endereco.cep,
                  street_name: data.endereco.rua,
                  street_number: data.endereco.numero,
                },
              }
            : {}),
        },
        payment_methods: {
          excluded_payment_types: ALL_NON_CARD_TYPES.map((id) => ({ id })),
          installments: 3,
        },
        metadata: {
          entrega: data.entrega,
          telefone: data.comprador.telefone,
          ...(data.entrega === "correio"
            ? {
                cep: data.endereco.cep,
                rua: data.endereco.rua,
                numero: data.endereco.numero,
                complemento: data.endereco.complemento ?? "",
                bairro: data.endereco.bairro,
                cidade: data.endereco.cidade,
                uf: data.endereco.uf,
              }
            : {}),
        },
        back_urls: {
          success: `${baseUrl}/pedido-confirmado`,
          pending: `${baseUrl}/pedido-confirmado`,
          failure: `${baseUrl}/pedido-confirmado`,
        },
        auto_return: "approved",
        statement_descriptor: "COLECAOANCORA",
      },
    });

    if (!result.init_point) {
      throw new Error("Mercado Pago não retornou o link de pagamento (init_point).");
    }

    return { initPoint: result.init_point };
  });

// Cria o pagamento PIX diretamente via Payments API (Checkout Transparente).
// Retorna o código "copia e cola" e o QR code em base64 para exibir na própria
// página, sem redirecionar o cliente para o Mercado Pago.
export const createPixPayment = createServerFn({ method: "POST" })
  .validator((input: unknown) => checkoutInputSchema.parse(input))
  .handler(async ({ data }) => {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente do projeto.",
      );
    }

    const price = PRICES[data.entrega];
    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const [nomeFirst, ...nomeRest] = data.comprador.nome.trim().split(/\s+/);
    const sobrenome = nomeRest.join(" ");

    const result = await payment.create({
      body: {
        transaction_amount: price,
        description:
          data.entrega === "presencial"
            ? "Quando a Saudade Permanece — retirada presencial no lançamento oficial"
            : "Quando a Saudade Permanece — envio pelo Correio (frete grátis)",
        payment_method_id: "pix",
        payer: {
          email: data.comprador.email,
          first_name: nomeFirst ?? data.comprador.nome,
          ...(sobrenome ? { last_name: sobrenome } : {}),
          identification: { type: "CPF", number: data.comprador.cpf },
        },
        metadata: {
          entrega: data.entrega,
          telefone: data.comprador.telefone,
          ...(data.entrega === "correio"
            ? {
                cep: data.endereco.cep,
                rua: data.endereco.rua,
                numero: data.endereco.numero,
                complemento: data.endereco.complemento ?? "",
                bairro: data.endereco.bairro,
                cidade: data.endereco.cidade,
                uf: data.endereco.uf,
              }
            : {}),
        },
      },
      requestOptions: { idempotencyKey: randomUUID() },
    });

    const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

    if (!result.id || !qrCode) {
      throw new Error("Mercado Pago não retornou o código Pix (qr_code).");
    }

    return {
      paymentId: String(result.id),
      status: result.status ?? "pending",
      qrCode,
      qrCodeBase64: qrCodeBase64 ?? null,
    };
  });

const paymentIdSchema = z.object({ paymentId: z.string().min(1) });

// Consulta o status atual de um pagamento (usado para o polling da tela de
// pagamento saber quando o Pix foi confirmado).
export const getPaymentStatus = createServerFn({ method: "POST" })
  .validator((input: unknown) => paymentIdSchema.parse(input))
  .handler(async ({ data }) => {
    const accessToken = process.env["MERCADOPAGO_ACCESS_TOKEN"];
    if (!accessToken) {
      throw new Error(
        "MERCADOPAGO_ACCESS_TOKEN não configurado nas variáveis de ambiente do projeto.",
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const result = await payment.get({ id: data.paymentId });

    return { status: result.status ?? "pending" };
  });
