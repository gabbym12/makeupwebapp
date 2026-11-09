# The Makeup Counter

A responsive makeup storefront starter connected to Shopify. The first version
has an empty catalog state so products can be added from the connected Shopify
store rather than shown as invented demo inventory.

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

Development mode adds Shopify's `channel=online_store` preview parameter for
protected development stores. For a production deployment, set
`SHOPIFY_USE_DEV_STORE_PREVIEW=true` while it still targets a development store;
set it to `false` for a live store. Production defaults to the live-store URL.