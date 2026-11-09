# Project notes

This project is a React + Vite makeup shop connected to Shopify, with a separate
Shade Match mini-game.

- `/` is the Shopify storefront. It shows published products, or an empty state
  when the connected catalog has none.
- `/game` is a five-round, makeup-themed color matching game. Its shade swatches
  are game content and are not Shopify products.
- The shop's bag and checkout use Shopify's cart and hosted checkout.

## Running the app

The Replit workflow **Start application** runs:

```sh
npm run dev
```

For a production build, run:

```sh
npm run build
```

The displayed store name is provisional. Add and publish real products through
Shopify for them to appear in the store.
