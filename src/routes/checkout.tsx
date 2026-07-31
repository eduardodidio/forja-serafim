import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { brl } from "@/lib/store-data";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const SHIPPING = 24.9;

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — A Casa do Serafim" },
      { name: "description", content: "Finalize seu pedido de proxies full art com PIX ou cartão." },
      { property: "og:title", content: "Checkout — A Casa do Serafim" },
      { property: "og:description", content: "Finalize seu pedido de proxies full art com PIX ou cartão." },
    ],
  }),
  component: Checkout,
});

const fields = [
  { name: "nome", label: "Nome completo", type: "text", span: 2 },
  { name: "email", label: "Email", type: "email", span: 1 },
  { name: "whatsapp", label: "WhatsApp", type: "tel", span: 1 },
  { name: "endereco", label: "Endereço", type: "text", span: 2 },
  { name: "cidade", label: "Cidade", type: "text", span: 1 },
  { name: "estado", label: "Estado", type: "text", span: 1 },
  { name: "cep", label: "CEP", type: "text", span: 1 },
];

function Checkout() {
  const { subtotal, clear, items } = useStore();
  const [payment, setPayment] = useState<"pix" | "cartao">("pix");
  const [done, setDone] = useState(false);
  const total = subtotal + (items.length ? SHIPPING : 0);

  if (done) {
    return (
      <PageShell>
        <div className="mx-auto max-w-xl px-5 py-32 text-center">
          <CheckCircle2 className="mx-auto size-14 text-gold" />
          <h1 className="mt-8 text-3xl sm:text-4xl">Seu pedido foi recebido.</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Em breve entraremos em contato pelo WhatsApp com a confirmação e o prazo de produção
            das suas artes.
          </p>
          <Link
            to="/colecoes"
            className="mt-9 inline-flex rounded-full bg-gold px-7 py-3.5 text-sm font-medium text-primary-foreground"
          >
            Continuar explorando
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-5 py-16">
        <h1 className="text-4xl sm:text-5xl">Checkout</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            clear();
            setDone(true);
            toast.success("Pedido enviado com sucesso");
          }}
          className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]"
        >
          <div className="surface-card grid gap-5 p-7 sm:grid-cols-2">
            {fields.map((f) => (
              <label key={f.name} className={cn("block", f.span === 2 && "sm:col-span-2")}>
                <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {f.label}
                </span>
                <input
                  required
                  type={f.type}
                  name={f.name}
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
                />
              </label>
            ))}
            <label className="block sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Observações
              </span>
              <textarea
                name="observacoes"
                rows={4}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold/60"
              />
            </label>

            <div className="sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Forma de pagamento
              </span>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(["pix", "cartao"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPayment(p)}
                    className={cn(
                      "rounded-xl border border-border bg-background p-4 text-left text-sm transition-colors hover:border-gold/60",
                      payment === p && "border-gold bg-gold/10 text-gold",
                    )}
                  >
                    {p === "pix" ? "PIX" : "Cartão"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <aside className="surface-card h-fit p-6">
            <p className="font-display text-lg">Resumo</p>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{brl(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Frete</dt>
                <dd>{brl(items.length ? SHIPPING : 0)}</dd>
              </div>
              <div className="hairline flex justify-between pt-4 font-display text-xl">
                <dt>Total</dt>
                <dd className="text-gold">{brl(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              className="mt-7 w-full rounded-full bg-gold py-4 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Finalizar Pedido
            </button>
          </aside>
        </form>
      </div>
    </PageShell>
  );
}
