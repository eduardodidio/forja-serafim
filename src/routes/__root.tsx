import { Outlet, Link, createRootRoute } from "@tanstack/react-router";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { whatsappLink } from "@/lib/store-data";
import { getOrganizationJsonLd, SITE } from "@/lib/seo";

function RootComponent() {
  const orgJsonLd = getOrganizationJsonLd();

  return (
    <>
      {/* Anti-FOUC: apply dark class before React hydrates */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme');if(t!=='light')document.documentElement.classList.add('dark')})()`,
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <Outlet />
    </>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 text-6xl text-gold/30">&#9733;</div>
        <h1 className="font-display text-7xl font-bold text-gold">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Esta carta nao esta no seu deck
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A pagina que voce procura nao existe ou foi removida.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/colecoes"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
          >
            Ver colecoes
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
          >
            Voltar ao inicio
          </Link>
          <a
            href={whatsappLink("Ola! Tentei acessar uma pagina que nao existe no site.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-gold/60 hover:text-gold"
          >
            <WhatsAppIcon className="size-4 text-[#25D366]" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#d4a853" },
      { property: "og:site_name", content: SITE.NAME },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [
      { rel: "canonical", href: SITE.URL },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
});
