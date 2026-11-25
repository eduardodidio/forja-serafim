import { useState } from "react";
import { Truck, MapPin, Package, Zap } from "lucide-react";
import { shippingRegions, originAddress } from "@/lib/store-data";
import { useReveal } from "@/hooks/useReveal";

type ShippingResult = {
  region: string;
  pacPrice: number;
  pacDays: string;
  sedexPrice: number;
  sedexDays: string;
};

type ViaCepResponse = {
  cep: string;
  logradouro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return digits;
}

function findRegionByState(uf: string): ShippingResult | null {
  const region = shippingRegions.find((r) => r.states.includes(uf));
  if (!region) return null;
  return {
    region: region.region,
    pacPrice: region.pacPrice,
    pacDays: region.pacDays,
    sedexPrice: region.sedexPrice,
    sedexDays: region.sedexDays,
  };
}

function Reveal({
  direction = "up" as "up" | "left" | "right",
  delay = 0,
  children,
  className = "",
}: {
  direction?: "up" | "left" | "right";
  delay?: number;
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, style } = useReveal(direction, delay);
  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}

export function ShippingSimulator() {
  const [cep, setCep] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [manualRegion, setManualRegion] = useState("");

  const handleCepChange = (value: string) => {
    setCep(maskCep(value));
    setError("");
    setResult(null);
    setLocation("");
  };

  const handleCalculate = async () => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP valido com 8 digitos.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setLocation("");

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data: ViaCepResponse = await res.json();

      if (data.erro) {
        setError("CEP nao encontrado. Selecione sua regiao abaixo.");
        setLoading(false);
        return;
      }

      setLocation(`${data.localidade} - ${data.uf}`);
      const regionResult = findRegionByState(data.uf);
      if (regionResult) {
        setResult(regionResult);
      } else {
        setError("Regiao nao encontrada. Selecione manualmente abaixo.");
      }
    } catch {
      setError("Nao foi possivel consultar o CEP. Selecione sua regiao abaixo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSelect = (regionName: string) => {
    setManualRegion(regionName);
    const region = shippingRegions.find((r) => r.region === regionName);
    if (region) {
      setResult({
        region: region.region,
        pacPrice: region.pacPrice,
        pacDays: region.pacDays,
        sedexPrice: region.sedexPrice,
        sedexDays: region.sedexDays,
      });
    }
  };

  return (
    <Reveal>
      <section id="frete" className="mx-auto max-w-7xl px-5 py-16">
        <div className="surface-card overflow-hidden lg:grid lg:grid-cols-2">
          {/* Left — info */}
          <div className="flex flex-col justify-center bg-gradient-to-br from-card to-background p-8 lg:p-12">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-gold" />
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Frete</p>
            </div>
            <h2 className="mt-4 text-3xl leading-tight sm:text-4xl">
              Simule o envio para sua cidade
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Digite seu CEP para calcular o valor estimado do frete. Enviamos para todo o Brasil
              via PAC e SEDEX.
            </p>
            {originAddress && (
              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground/60">
                <MapPin className="size-3.5" />
                <span>Enviamos de {originAddress}</span>
              </div>
            )}
          </div>

          {/* Right — calculator */}
          <div className="space-y-5 p-8 lg:p-12">
            {/* CEP input */}
            <div>
              <label htmlFor="shipping-cep" className="text-sm font-medium text-muted-foreground">
                Seu CEP
              </label>
              <div className="mt-1.5 flex gap-3">
                <input
                  id="shipping-cep"
                  type="text"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                  placeholder="00000-000"
                  maxLength={9}
                  className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
                />
                <button
                  onClick={handleCalculate}
                  disabled={loading || cep.replace(/\D/g, "").length !== 8}
                  className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "..." : "Calcular"}
                </button>
              </div>
            </div>

            {/* Location display */}
            {location && (
              <p className="text-sm text-gold">
                <MapPin className="inline size-3.5 mr-1" />
                {location}
              </p>
            )}

            {/* Error + fallback */}
            {error && (
              <div>
                <p className="text-sm text-red-400">{error}</p>
                <div className="mt-3">
                  <label
                    htmlFor="region-select"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Selecione sua regiao
                  </label>
                  <select
                    id="region-select"
                    value={manualRegion}
                    onChange={(e) => handleRegionSelect(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-gold/60"
                  >
                    <option value="">Selecione...</option>
                    {shippingRegions.map((r) => (
                      <option key={r.region} value={r.region}>
                        {r.region} ({r.states.join(", ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Results */}
            {result && (
              <div className="space-y-3 rounded-xl border border-border/50 bg-background/50 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">
                  Estimativa para {result.region}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-start gap-3 rounded-lg border border-border/30 p-4">
                    <Package className="mt-0.5 size-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">PAC</p>
                      <p className="text-lg font-display">R$ {result.pacPrice}</p>
                      <p className="text-xs text-muted-foreground">{result.pacDays} dias uteis</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-lg border border-border/30 p-4">
                    <Zap className="mt-0.5 size-4 text-gold" />
                    <div>
                      <p className="text-sm font-medium">SEDEX</p>
                      <p className="text-lg font-display text-gold">R$ {result.sedexPrice}</p>
                      <p className="text-xs text-muted-foreground">{result.sedexDays} dias uteis</p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground/50">
                  Valores estimados. O frete final e confirmado no momento do pedido.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabela de frete por regiao */}
        <div className="mt-8">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">
            Tabela de frete por regiao
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Regiao</th>
                  <th className="pb-3 pr-4 font-medium">PAC</th>
                  <th className="pb-3 pr-4 font-medium">Prazo PAC</th>
                  <th className="pb-3 pr-4 font-medium">SEDEX</th>
                  <th className="pb-3 font-medium">Prazo SEDEX</th>
                </tr>
              </thead>
              <tbody>
                {shippingRegions.map((r) => (
                  <tr key={r.region} className="border-b border-border/20">
                    <td className="py-3 pr-4">
                      <span className="font-medium">{r.region}</span>
                      <span className="ml-2 text-xs text-muted-foreground/60">
                        {r.states.join(", ")}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-display">R$ {r.pacPrice}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{r.pacDays} dias</td>
                    <td className="py-3 pr-4 font-display text-gold">R$ {r.sedexPrice}</td>
                    <td className="py-3 text-muted-foreground">{r.sedexDays} dias</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground/50">
            Frete pago pelo cliente. Valores estimados — o custo final e confirmado no momento do
            pedido.
          </p>
        </div>
      </section>
    </Reveal>
  );
}
