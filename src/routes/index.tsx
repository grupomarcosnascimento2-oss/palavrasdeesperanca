import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Anchor, ArrowDown, Gift, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import bookCover from "@/assets/book-cover.png";
import horizon from "@/assets/anchor-horizon.jpg";
import contemplativeSea from "@/assets/contemplative-sea.jpg";
import bibleLantern from "@/assets/bible-lantern.jpg";
import padreWesley from "@/assets/padre-wesley.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quando a Saudade Permanece | Pré-lançamento" },
      { name: "description", content: "Garanta antecipadamente seu exemplar da primeira tiragem de Quando a Saudade Permanece, do Pe. Wesley Xavier Ramos." },
      { property: "og:title", content: "Quando a Saudade Permanece | Pré-lançamento" },
      { property: "og:description", content: "A saudade pode permanecer. A esperança também." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PREORDER_URL = "#pre-lancamento"; // Substitua pela URL final de compra.

function AnchorMark({ small = false }: { small?: boolean }) {
  return <span className={`inline-flex items-center justify-center rounded-full border border-gold/60 text-gold ${small ? "size-8" : "size-14"}`}><Anchor className={small ? "size-4" : "size-7"} strokeWidth={1.4} /></span>;
}

function Divider() {
  return <div className="mx-auto flex max-w-xs items-center gap-4" aria-hidden="true"><span className="gold-rule flex-1"/><Anchor className="size-4 text-gold"/><span className="gold-rule flex-1"/></div>;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-gold">{children}</p>;
}

function PreorderButton({ label = "Quero garantir meu exemplar", outline = false, href = PREORDER_URL }: { label?: string; outline?: boolean; href?: string }) {
  return <Button asChild variant={outline ? "goldOutline" : "gold"} size="lg" className="h-13 w-full px-6 text-xs font-bold uppercase tracking-[0.12em] sm:w-auto"><a href={href}><Anchor className="size-4" />{label}</a></Button>;
}

function Index() {
  const [delivery, setDelivery] = useState<"presencial" | "correio">("presencial");
  const price = delivery === "correio" ? "R$ 49,90" : "R$ 29,90";
  const journey = [
    ["01", "Dor", "Acolher a dor da despedida sem culpa."],
    ["02", "Memória", "Guardar aquilo que o amor deixou."],
    ["03", "Amor", "Descobrir que o amor não termina com a ausência."],
    ["04", "Fé", "Encontrar Deus também no silêncio."],
    ["05", "Esperança", "Continuar com os olhos voltados para a Ressurreição."],
  ];
  const forWhom = ["Para quem perdeu alguém especial.", "Para quem sente uma saudade que ainda dói.", "Para quem procura palavras de fé depois de uma despedida.", "Para quem deseja guardar a memória sem ficar preso à dor.", "Famílias que estão aprendendo a continuar juntas.", "E para todos que precisam lembrar que ainda existe esperança."];

  return <main className="overflow-hidden bg-background text-foreground">
    <section className="relative min-h-[94svh] bg-navy text-ivory">
      <img src={horizon} alt="Mar e capela no horizonte ao entardecer" className="absolute inset-0 size-full object-cover" width={1920} height={1088}/>
      <div className="absolute inset-0 image-shade"/>
      <div className="section-shell relative z-10 flex min-h-[94svh] flex-col justify-between py-6 sm:py-10">
        <header className="flex items-center justify-between border-b border-gold/30 pb-4">
          <div className="flex items-center gap-3"><AnchorMark small/><div><p className="font-display text-lg leading-none">Coleção Âncora</p><p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-gold">Palavras de esperança</p></div></div>
          <a href="#o-livro" className="hidden items-center gap-2 text-xs uppercase tracking-[0.16em] text-ivory/80 sm:flex">Conhecer o livro <ArrowDown className="size-4"/></a>
        </header>
        <div className="grid items-center gap-10 py-12">
          <div className="max-w-2xl">
            <Eyebrow>Coleção Âncora · Livro I</Eyebrow>
            <h1 className="text-balance text-5xl leading-[0.94] sm:text-6xl lg:text-7xl">A saudade pode permanecer.<br/><span className="font-script text-[1.18em] font-normal text-gold">Mas você não precisa</span><br/>caminhar sozinho.</h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-ivory/80 sm:text-lg">Um livro de fé, acolhimento e esperança para quem está aprendendo a continuar depois de uma despedida.</p>
            <div className="my-8 mx-auto w-[min(78vw,380px)]"><img src={bookCover} alt="Capa do livro Quando a Saudade Permanece" width={853} height={1280} className="w-full object-contain drop-shadow-2xl"/></div>
            <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center"><PreorderButton/></div>
            <p className="mt-5 text-xs text-ivory/72">Pré-lançamento · Lançamento oficial em 2 de novembro · Dia de Finados</p>
          </div>
        </div>
      </div>
    </section>

    <section id="o-livro" className="bg-ivory py-24 sm:py-32"><div className="section-shell">
      <div className="mx-auto max-w-2xl"><Eyebrow>Quando a Saudade Permanece</Eyebrow><h2 className="text-balance text-4xl text-navy sm:text-5xl">Um livro para caminhar ao lado de quem sente saudade.</h2><div className="mt-7 space-y-5 leading-8 text-charcoal/82"><p>Não foi escrito para oferecer respostas fáceis diante da dor. Foi escrito para oferecer presença.</p><p>Para lembrar que chorar não é falta de fé. Que sentir saudade não significa estar preso ao passado. E que a esperança cristã não apaga a dor — ela nos ajuda a atravessá-la.</p></div><div className="mt-9 border-y border-gold/40 py-7 font-display text-2xl text-navy">Não é um livro para ensinar você a esquecer.<br/><span className="text-gold">É um livro para ajudar você a continuar.</span></div></div>
    </div></section>

    <section className="bg-gradient-to-b from-background via-ivory to-background py-16 shadow-inner sm:py-20"><div className="section-shell"><div className="mx-auto max-w-2xl text-center"><p className="mb-4 text-base font-semibold uppercase tracking-[0.14em] text-gold sm:text-lg">O que você vai encontrar no livro</p><h2 className="text-xl text-navy sm:text-2xl">Uma caminhada ao encontro da esperança.</h2></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{journey.map(([n,t,d])=><div key={n} className="group rounded-xl border border-gold/30 bg-gradient-to-b from-ivory to-background p-5 text-center shadow-md transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl"><span className="mx-auto flex size-9 items-center justify-center rounded-full bg-gold/10 font-display text-base text-gold transition-colors group-hover:bg-gold/20">{n}</span><h3 className="mt-4 text-lg text-navy">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p></div>)}</div></div></section>

    <section className="bg-navy py-24 text-ivory sm:py-32">
      <div className="section-shell grid items-center gap-14 lg:grid-cols-2">
        <div><Eyebrow>Antes de tudo, acolher</Eyebrow><h2 className="text-balance text-4xl sm:text-5xl">Há saudades que não desaparecem.</h2><div className="mt-7 space-y-4 text-base leading-8 text-ivory/80"><p>Algumas despedidas mudam a nossa maneira de olhar para a vida.</p><p>Ficam as lembranças. Ficam as perguntas. Ficam palavras que gostaríamos de ter dito. Ficam momentos que gostaríamos de reviver. E fica a saudade.</p></div><blockquote className="mt-8 border-l border-gold pl-6 text-2xl leading-snug text-gold">Você não precisa esquecer para continuar.<br/>Pode aprender a caminhar com a saudade.</blockquote></div>
        <figure className="relative"><img src={contemplativeSea} alt="Pessoa observa o mar e a luz no horizonte" loading="lazy" width={1600} height={1008} className="aspect-[4/3] w-full object-cover grayscale-[20%]"/><figcaption className="absolute bottom-0 left-0 bg-navy/85 px-5 py-3 font-display text-lg text-ivory">Este livro parte de uma resposta diferente.</figcaption></figure>
      </div>
    </section>


    <section className="relative bg-navy py-24 text-ivory sm:py-32"><div className="section-shell grid items-center gap-14 lg:grid-cols-2"><div><Eyebrow>Por que ler este livro</Eyebrow><h2 className="text-balance text-4xl font-display text-gold sm:text-5xl">Por que devo ler este livro?</h2><div className="mt-7 space-y-4 max-w-xl leading-8 text-ivory/85"><p>Porque a dor de uma despedida não precisa ser enfrentada sozinho. Porque existe conforto na Palavra de Deus para quem sente saudade. E porque, mesmo em meio ao luto, ainda é possível encontrar esperança.</p><p>Se você busca um caminho de fé para atravessar essa dor — ou quer oferecer esse caminho a alguém que ama — estas páginas foram escritas para caminhar ao seu lado, com a Palavra como companhia.</p></div><div className="mt-10 space-y-8"><blockquote><p className="text-2xl text-ivory">“Jesus chorou.”</p><cite className="mt-2 block text-xs not-italic uppercase tracking-[0.18em] text-gold">João 11,35</cite></blockquote><blockquote><p className="text-2xl text-ivory">“Eu sou a ressurreição e a vida.”</p><cite className="mt-2 block text-xs not-italic uppercase tracking-[0.18em] text-gold">João 11,25</cite></blockquote><blockquote className="border-l border-gold pl-6"><p className="text-3xl leading-snug text-gold">“Temos esta esperança como âncora da alma, firme e segura.”</p><cite className="mt-3 block text-xs not-italic uppercase tracking-[0.18em] text-ivory/72">Hebreus 6,19</cite></blockquote></div></div><img src={bibleLantern} alt="Bíblia aberta ao lado de uma lanterna acesa" loading="lazy" width={1600} height={1072} className="aspect-[4/3] w-full object-cover ring-1 ring-gold/30"/></div></section>

    <section className="relative isolate min-h-[680px] bg-charcoal py-24 text-ivory sm:py-32"><img src={horizon} alt="Luz dourada sobre o mar e rochas" loading="lazy" width={1920} height={1088} className="absolute inset-0 -z-20 size-full object-cover opacity-35"/><div className="absolute inset-0 -z-10 bg-charcoal/75"/><div className="section-shell"><div className="max-w-2xl"><AnchorMark/><h2 className="mt-8 text-balance text-4xl sm:text-6xl">Quando tudo parece perder o chão, ainda existe uma âncora.</h2><div className="mt-7 space-y-4 text-lg leading-8 text-ivory/75"><p>A âncora não impede as ondas. Ela impede que o barco seja levado por elas.</p><p>Assim também é a esperança cristã. Ela não promete uma vida sem dor. Ela nos sustenta quando a dor chega.</p></div><blockquote className="mt-10 text-3xl text-gold">A saudade pode permanecer.<br/>A âncora também.</blockquote></div></div></section>

    <section className="bg-ivory py-24 sm:py-32"><div className="section-shell"><div className="max-w-2xl"><Eyebrow>Um encontro possível</Eyebrow><h2 className="text-4xl text-navy sm:text-5xl">Talvez este livro seja para você.<br/>Ou para alguém que você ama.</h2></div><div className="mt-14 grid border-t border-gold/40 md:grid-cols-2">{forWhom.map((item,i)=><div key={item} className="flex gap-4 border-b border-gold/25 py-6 md:odd:border-r md:odd:pr-8 md:even:pl-8"><Heart className="mt-1 size-4 shrink-0 text-gold"/><p className="text-base leading-7 text-charcoal/82">{item}</p></div>)}</div></div></section>

    <section className="bg-ivory py-24 sm:py-32"><div className="section-shell grid gap-12 lg:grid-cols-[.7fr_1.3fr]"><img src={padreWesley} alt="Pe. Wesley Xavier Ramos em oração" loading="lazy" className="aspect-[4/5] w-full rounded-lg object-cover shadow-xl ring-1 ring-gold/40"/><div className="self-center"><Eyebrow>Sobre o autor</Eyebrow><h2 className="text-4xl text-navy sm:text-5xl">Presença, escuta, silêncio e fé.</h2><p className="mt-7 max-w-2xl text-lg leading-9 text-charcoal/80">Sacerdote e presença pastoral junto a pessoas e famílias em momentos de dor e despedida, Pe. Wesley Xavier Ramos escreve a partir da escuta e do acompanhamento espiritual.</p><blockquote className="mt-9 border-l border-gold pl-6 text-3xl leading-snug text-gold">“Este livro não nasceu da tentativa de explicar a dor. Nasceu da experiência de permanecer ao lado de quem sofre.”</blockquote></div></div></section>

    <section id="pre-lancamento" className="bg-navy py-24 text-ivory sm:py-32"><div className="section-shell">
      <div className="border-b border-gold/40 pb-14"><Eyebrow>Pré-lançamento</Eyebrow><h2 className="text-balance text-4xl sm:text-6xl">O primeiro exemplar pode ser seu antes do lançamento.</h2><p className="mt-7 max-w-2xl leading-8 text-ivory/80">O lançamento oficial acontecerá em 2 de novembro de 2026, no Dia de Finados. O pré-lançamento é uma oportunidade de garantir antecipadamente seu exemplar impresso da primeira tiragem, que é limitada.</p></div>

      <div className="py-14"><Eyebrow>Como você vai receber o seu exemplar</Eyebrow><h3 className="text-balance text-3xl sm:text-4xl">Escolha como prefere participar.</h3>
        <div role="radiogroup" aria-label="Forma de recebimento do exemplar" className="mt-10 grid gap-6 md:grid-cols-2">
          <button type="button" role="radio" aria-checked={delivery === "presencial"} onClick={() => setDelivery("presencial")} className={`flex flex-col items-start gap-3 rounded-xl border p-7 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl ${delivery === "presencial" ? "border-gold bg-gradient-to-b from-gold/15 to-transparent shadow-lg" : "border-gold/30 bg-gradient-to-b from-navy-soft to-navy hover:border-gold/60"}`}>
            <span className="flex items-center gap-3"><span className={`flex size-5 items-center justify-center rounded-full border ${delivery === "presencial" ? "border-gold" : "border-ivory/40"}`}>{delivery === "presencial" && <span className="size-2.5 rounded-full bg-gold"/>}</span><Gift className="size-5 text-gold" strokeWidth={1.4}/></span>
            <h4 className="text-xl">Presencial, no dia do lançamento</h4>
            <p className="font-display text-2xl text-gold">R$ 29,90</p>
            <p className="text-sm leading-6 text-ivory/72">Retire seu exemplar pessoalmente em 2 de novembro de 2026 e participe da noite de autógrafos com o Pe. Wesley Xavier Ramos.</p>
          </button>
          <button type="button" role="radio" aria-checked={delivery === "correio"} onClick={() => setDelivery("correio")} className={`flex flex-col items-start gap-3 rounded-xl border p-7 text-left shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl ${delivery === "correio" ? "border-gold bg-gradient-to-b from-gold/15 to-transparent shadow-lg" : "border-gold/30 bg-gradient-to-b from-navy-soft to-navy hover:border-gold/60"}`}>
            <span className="flex items-center gap-3"><span className={`flex size-5 items-center justify-center rounded-full border ${delivery === "correio" ? "border-gold" : "border-ivory/40"}`}>{delivery === "correio" && <span className="size-2.5 rounded-full bg-gold"/>}</span><Anchor className="size-5 text-gold" strokeWidth={1.4}/></span>
            <h4 className="text-xl">Pelo Correio, no conforto da sua casa</h4>
            <p className="font-display text-2xl text-gold">R$ 49,90 <span className="text-sm font-sans uppercase tracking-[0.1em] text-ivory/72">frete grátis</span></p>
            <p className="text-sm leading-6 text-ivory/72">Receba em casa, com entrega em até 10 dias úteis a partir de 2 de novembro de 2026, para quem não puder estar presente.</p>
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 border-t border-gold/40 pt-14 text-center"><PreorderButton label={`Garantir meu exemplar · ${price}`} href={`${PREORDER_URL}?entrega=${delivery}`}/></div>
    </div></section>

    <section className="relative isolate bg-navy py-28 text-center text-ivory sm:py-40"><img src={horizon} alt="Horizonte iluminado sobre o mar" loading="lazy" width={1920} height={1088} className="absolute inset-0 -z-20 size-full object-cover"/><div className="absolute inset-0 -z-10 bg-navy/70"/><div className="section-shell"><AnchorMark/><h2 className="mx-auto mt-8 max-w-4xl text-balance text-4xl sm:text-6xl">Quando a saudade permanece,<br/><span className="font-script text-[1.2em] text-gold">a esperança</span> pode continuar iluminando o caminho.</h2><p className="mt-7 text-ivory/75">Garanta seu exemplar no pré-lançamento de <em>Quando a Saudade Permanece</em>.</p><div className="mt-9"><PreorderButton label="Garantir meu exemplar"/></div><p className="mt-5 text-xs uppercase tracking-[0.18em] text-ivory/72">Coleção Âncora · Livro I · 2 de novembro · Dia de Finados</p></div></section>

    {/* TODO: revisar as formas de pagamento com informação real antes de publicar. */}
    <section className="bg-ivory py-24 sm:py-32"><div className="section-shell mx-auto max-w-2xl"><div className="text-center"><Eyebrow>Perguntas frequentes</Eyebrow><h2 className="text-4xl text-navy sm:text-5xl">Ainda com alguma dúvida?</h2></div><div className="mt-14 divide-y divide-gold/20 rounded-2xl border border-gold/30 bg-gradient-to-b from-background to-ivory p-2 shadow-lg sm:p-4">
      <details className="group px-4 py-6"><summary className="cursor-pointer list-none text-lg text-navy marker:content-none">O livro é físico ou digital?</summary><p className="mt-3 leading-7 text-charcoal/80">É um livro impresso, físico — pensado para ser lido, guardado e relido.</p></details>
      <details className="group px-4 py-6"><summary className="cursor-pointer list-none text-lg text-navy marker:content-none">Quando e como recebo meu exemplar?</summary><p className="mt-3 leading-7 text-charcoal/80">Há duas formas de participar. Você pode retirar o livro pessoalmente no dia 2 de novembro de 2026, no lançamento oficial, e participar da noite de autógrafos com o Pe. Wesley. Ou, se preferir, pode recebê-lo pelo Correio no conforto da sua casa — a entrega acontece em até 10 dias úteis após o lançamento oficial de 2 de novembro de 2026.</p></details>
      <details className="group px-4 py-6"><summary className="cursor-pointer list-none text-lg text-navy marker:content-none">Quais as formas de pagamento?</summary><p className="mt-3 leading-7 text-charcoal/80">[Preencher: meios de pagamento aceitos.]</p></details>
      <details className="group px-4 py-6"><summary className="cursor-pointer list-none text-lg text-navy marker:content-none">Posso presentear alguém com este livro?</summary><p className="mt-3 leading-7 text-charcoal/80">Sim. Ao garantir seu exemplar, você pode indicar que se trata de um presente — é uma forma silenciosa de dizer "estou aqui com você" para quem estiver enfrentando uma despedida.</p></details>
    </div></div></section>

    <footer className="bg-navy py-14 text-center text-ivory"><div className="section-shell"><Divider/><p className="mt-7 font-display text-2xl">Coleção Âncora</p><p className="mt-2 text-xs uppercase tracking-[0.18em] text-gold">Palavras de esperança para os caminhos da vida</p><p className="mt-8 text-sm text-ivory/65">Livro I · Quando a Saudade Permanece · Pe. Wesley Xavier Ramos</p><a href="https://wa.me/556191119324" target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm text-gold underline-offset-4 hover:underline">Falar com Padre Wesley</a><p className="mt-3 text-xs text-ivory/50">© 2026. Todos os direitos reservados.</p></div></footer>

  </main>;
}