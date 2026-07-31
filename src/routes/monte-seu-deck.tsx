import { createFileRoute } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/monte-seu-deck")({
  head: () => ({
    meta: [
      { title: "Monte seu Deck — A Casa do Serafim" },
      {
        name: "description",
        content:
          "Envie sua decklist em TXT, CSV ou cole a lista e receba um orçamento de proxies full art personalizadas.",
      },
      { property: "og:title", content: "Monte seu Deck — A Casa do Serafim" },
      {
        property: "og:description",
        content: "Envie sua decklist e receba um orçamento de proxies full art personalizadas.",
      },
    ],
  }),
  component: MonteSeuDeck,
});

const finishes = [
  { id: "normal", label: "Todas normais", hint: "Acabamento fosco premium" },
  { id: "foil", label: "Todas foil", hint: "Holográfico em todas as cartas" },
  { id: "mix", label: "Misturar foil e normal", hint: "Você escolhe quais serão foil" },
];

function MonteSeuDeck() {
  const [finish, setFinish] = useState("normal");
  const [fileName, setFileName] = useState("");
  const [list, setList] = useState("");

  const lines = list.split("\n").filter((l) => l.trim()).length;

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Sob encomenda</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Monte seu Deck</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Envie sua lista completa e escolha o acabamento. Nós cuidamos da arte, da diagramação e da
          impressão de todo o deck com identidade visual única.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Orçamento solicitado! Responderemos pelo WhatsApp em até 24h.");
          }}
          className="mt-12 space-y-8"
        >
          <div className="surface-card p-7">
            <p className="font-display text-lg">1. Sua lista</p>

            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border px-6 py-10 text-center transition-colors hover:border-gold/60">
              <Upload className="size-5 text-gold" />
              <span className="text-sm">
                {fileName || "Enviar arquivo TXT ou CSV do seu deck"}
              </span>
              <span className="text-xs text-muted-foreground">Clique para selecionar</span>
              <input
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </label>

            <label className="mt-5 block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Ou cole sua lista
              </span>
              <textarea
                rows={9}
                value={list}
                onChange={(e) => setList(e.target.value)}
                placeholder={"1 Sol Ring\n1 Arcane Signet\n1 Command Tower"}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-gold/60"
              />
              {lines > 0 && (
                <span className="mt-2 block text-xs text-gold">{lines} linhas detectadas</span>
              )}
            </label>
          </div>

          <div className="surface-card p-7">
            <p className="font-display text-lg">2. Acabamento</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {finishes.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFinish(f.id)}
                  className={cn(
                    "rounded-xl border border-border bg-background p-4 text-left transition-colors hover:border-gold/60",
                    finish === f.id && "border-gold bg-gold/10",
                  )}
                >
                  <span className="block text-sm font-medium">{f.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{f.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="surface-card p-7">
            <p className="font-display text-lg">3. Tema desejado</p>
            <textarea
              rows={4}
              placeholder='Ex.: "Quero o tema Diablo", "Quero inspirado em Castlevania", "Criar arte exclusiva"'
              className="mt-5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Seu nome"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
              />
              <input
                required
                placeholder="WhatsApp"
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-gold py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            Solicitar orçamento
          </button>
        </form>
      </div>
    </PageShell>
  );
}
