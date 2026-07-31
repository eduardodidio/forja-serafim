import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Instagram, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — A Casa do Serafim" },
      {
        name: "description",
        content: "Fale com a Casa do Serafim por WhatsApp, Instagram, Discord ou email.",
      },
      { property: "og:title", content: "Contato — A Casa do Serafim" },
      { property: "og:description", content: "Fale com a Casa do Serafim sobre seu próximo deck." },
    ],
  }),
  component: Contato,
});

function Contato() {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-5 py-20">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Fale conosco</p>
        <h1 className="mt-3 text-4xl sm:text-5xl">Contato</h1>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {[
            { icon: MessageCircle, t: "WhatsApp", d: "Resposta em até 24h" },
            { icon: Instagram, t: "Instagram", d: "@casadoserafim" },
            { icon: Gamepad2, t: "Discord", d: "Comunidade de colecionadores" },
            { icon: Mail, t: "Email", d: "contato@casadoserafim.com" },
          ].map(({ icon: Icon, t, d }) => (
            <a key={t} href="#" className="surface-card p-6 transition-colors hover:border-gold/60">
              <Icon className="size-5 text-gold" />
              <p className="mt-4 font-display text-base">{t}</p>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </a>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Mensagem enviada! Em breve retornamos.");
          }}
          className="surface-card mt-10 space-y-5 p-7"
        >
          <input
            required
            placeholder="Seu nome"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
          />
          <input
            required
            type="email"
            placeholder="Seu email"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
          />
          <textarea
            required
            rows={5}
            placeholder="Como podemos ajudar?"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gold py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.01]"
          >
            Enviar mensagem
          </button>
        </form>
      </div>
    </PageShell>
  );
}
