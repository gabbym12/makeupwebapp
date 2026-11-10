# Project notes

This project is a React + Vite makeup shop connected to Shopify, with a separate
five-activity game arcade.

- `/` is the Shopify storefront. It shows published products, or an empty state
  when the connected catalog has none.
- `/game` is the game hub for Shade Match, Makeup Memory Match, Beauty Trivia,
  Build a Makeup Look, and Memory Challenge. The challenge grows from 6 to 10
  pairs over three rounds; wrong pairs turn back over, with a fixed layout
  within each round and new layouts later. Game content is illustrative and is
  not Shopify inventory.
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
