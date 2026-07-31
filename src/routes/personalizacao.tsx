import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/personalizacao")({
  head: () => ({
    meta: [
      { title: "Personalização exclusiva — A Casa do Serafim" },
      {
        name: "description",
        content:
          "Encomende artes exclusivas para o seu comandante: tema, referências e paleta definidos junto com nossos artistas.",
      },
      { property: "og:title", content: "Personalização exclusiva — A Casa do Serafim" },
      {
        property: "og:description",
        content: "Encomende artes exclusivas para o seu comandante com nossos artistas.",
      },
    ],
  }),
  component: Personalizacao,
});

function Personalizacao() {
  const [files, setFiles] = useState<string[]>([]);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Ateliê</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Personalização</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Para encomendas exclusivas, conte a sua ideia. Criamos a arte do zero, com composição,
          moldura e tipografia pensadas para o seu comandante.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Projeto solicitado! Entraremos em contato para alinhar os detalhes.");
          }}
          className="surface-card mt-12 space-y-5 p-7"
        >
          {[
            { label: "Nome do comandante", placeholder: "Ex.: Atraxa, Praetors' Voice" },
            { label: "Tema desejado", placeholder: "Ex.: Elden Ring, Dark Souls, Vampiros" },
            { label: "Referências", placeholder: "Links, artistas ou obras de referência" },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {f.label}
              </span>
              <input
                required
                placeholder={f.placeholder}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
              />
            </label>
          ))}

          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-9 text-center transition-colors hover:border-gold/60">
            <ImagePlus className="size-5 text-gold" />
            <span className="text-sm">Anexar imagens de referência</span>
            <span className="text-xs text-muted-foreground">
              {files.length ? files.join(", ") : "PNG, JPG até 10MB"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
            />
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Descrição livre
            </span>
            <textarea
              rows={6}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-accent py-4 text-sm font-medium text-accent-foreground transition-transform hover:scale-[1.01]"
          >
            Solicitar projeto
          </button>
        </form>
      </div>
    </PageShell>
  );
}
