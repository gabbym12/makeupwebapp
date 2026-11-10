# The Makeup Counter

A makeup storefront connected to Shopify, with a separate game arcade at
`/game`. The arcade includes Shade Match, Makeup Memory Match, Beauty Trivia,
Build a Makeup Look, and One-Take Memory. One-Take Memory ends the run if a
player misses a pair. The store shows published Shopify products rather than
invented demo inventory; the games use illustrative content.

## Run locally

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

The current storefront label is provisional. Product listings and checkout are
available for products published to the connected Shopify storefront. Shoppers
select a product variant in the app, then use Shopify's hosted checkout.

Open `/game` in the preview to choose from five activities, or use the
“Explore the games” link in the shop navigation.

Development mode adds Shopify's `channel=online_store` preview parameter for
protected development stores. For a production deployment, set
`SHOPIFY_USE_DEV_STORE_PREVIEW=true` while it still targets a development store;
set it to `false` for a live store. Production defaults to the live-store URL.