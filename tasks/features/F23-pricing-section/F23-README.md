# F23 — Pricing Section (Valores) + Shipping Simulator

**Status:** complete
**Created:** 2026-11-25
**Description:** Add a premium "Valores" section to the landing page with all product pricing, plus a CEP-based shipping cost simulator. All values editable via admin panel.

## Summary

Anderson provided the official pricing table for Forja Serafim. This feature:

1. Creates a `pricing.json` data file with all product categories and prices
2. Extends `settings.json` with origin address/CEP for shipping
3. Builds a `PricingSection` component on the landing page (dark/gold theme)
4. Builds a `ShippingSimulator` component using ViaCEP + static regional table
5. Adds a "Valores" tab to the admin panel for editing all prices
6. Adds origin address fields to the admin Settings tab

## Product Categories (defaults)

| #   | Product                                          | Standard   | Foil       |
| --- | ------------------------------------------------ | ---------- | ---------- |
| 1   | Deck Commander (100 cartas)                      | R$ 250     | R$ 350     |
| 2   | Deck Tematico Completo (100 cartas, arte custom) | R$ 500     | R$ 600     |
| 3   | Cartas Avulsas (min 9)                           | R$ 5/carta | R$ 8/carta |
| 4   | Arte Personalizada Avulsa                        | R$ 25/arte | —          |

Additional notes:

- Shipping paid by customer
- Themed decks have limited availability / waiting list
- Custom art printing charged separately
- Orders with special characteristics get individual quotes

## Shipping Strategy

- **Origin:** R. Osasco, 217 - Parque Florido, Gravatai - RS, 94075-300 (admin-editable)
- **CEP validation:** ViaCEP API (free, public)
- **Cost estimation:** Static regional table (reliable, no API key needed)
- **Modalities:** PAC and SEDEX with estimated cost and delivery days
- **Fallback:** If ViaCEP fails, user can still select region manually

## Tasks

| Task | Title                                                   | Wave | Depends       |
| ---- | ------------------------------------------------------- | ---- | ------------- |
| T01  | Data layer: pricing.json + settings extension           | W1   | —             |
| T02  | Admin API: pricing CRUD + settings origin fields        | W1   | —             |
| T03  | Landing page: PricingSection component                  | W2   | T01           |
| T04  | Landing page: ShippingSimulator component               | W2   | T01           |
| T05  | Admin UI: "Valores" tab for pricing management          | W2   | T02           |
| T06  | Admin UI: Origin address fields in Settings tab         | W2   | T02           |
| T07  | Integration: wire sections into index.tsx + store-data  | W3   | T03, T04      |
| T08  | Polish: responsive, animations, edge cases, build check | W3   | T05, T06, T07 |

## Waves

- **Wave 1 (2 tasks, parallel):** Data layer + Admin API — no dependencies
- **Wave 2 (4 tasks, parallel):** Landing page components + Admin UI tabs — each pair depends on its W1 counterpart
- **Wave 3 (2 tasks, sequential):** Integration wiring + polish/QA pass
