import { useEffect } from "react";
import { type Token } from "@/lib/store-data";
import { Card3DTilt } from "./card-3d-tilt";
import { cacheBust } from "@/lib/cache-bust";

type TokensModalProps = {
  tokens: Token[];
  isOpen: boolean;
  onClose: () => void;
};

export function TokensModal({ tokens, isOpen, onClose }: TokensModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "tokens-fade-in 0.2s ease-out" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Fechar"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal content */}
        <div
          className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-[oklch(0.75_0.09_82)]/20 bg-[oklch(0.13_0.012_265)] p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
          style={{ animation: "tokens-fade-in 0.2s ease-out" }}
        >
          <h2 className="mb-6 text-center font-display text-2xl text-[oklch(0.75_0.09_82)] sm:text-3xl">
            Tokens do Deck
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
            {tokens.map((token, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Card3DTilt className="relative w-full overflow-hidden rounded-2xl bg-card">
                  <div onContextMenu={(e) => e.preventDefault()}>
                    <img
                      src={cacheBust(token.image)}
                      alt={token.name}
                      loading="lazy"
                      width={400}
                      height={560}
                      className="size-full object-cover"
                      style={
                        {
                          userSelect: "none",
                          WebkitUserDrag: "none",
                          pointerEvents: "none",
                        } as React.CSSProperties
                      }
                      draggable={false}
                    />
                  </div>
                  {/* Quantity badge */}
                  <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-[oklch(0.75_0.09_82)] text-xs font-bold text-black sm:size-8 sm:text-sm">
                    x{token.quantity}
                  </span>
                </Card3DTilt>
                <span className="text-center text-sm text-white/80">{token.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tokens-fade-in {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
