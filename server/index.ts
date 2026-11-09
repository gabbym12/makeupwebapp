import { createServer as createHttpServer } from "node:http";
import { resolve } from "node:path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { shopifyStorefrontRequest } from "./shopifyStorefrontClient.ts";

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  featuredImage: { url: string; altText: string | null } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
};

type ProductsResponse = {
  products: { nodes: ShopifyProduct[] };
};

const productsQuery = `#graphql
  query Products {
    products(first: 24, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        description
        availableForSale
        featuredImage { url altText }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

const app = express();
const httpServer = createHttpServer(app);
const cacheDurationMs = 60_000;
let cachedProducts: { products: ShopifyProduct[]; expiresAt: number } | undefined;

app.get("/api/products", async (_request, response) => {
  response.setHeader("Cache-Control", "public, max-age=60");

  if (cachedProducts && Date.now() < cachedProducts.expiresAt) {
    response.json({ products: cachedProducts.products });
    return;
  }

  try {
    const result = await shopifyStorefrontRequest<ProductsResponse>(productsQuery);
    if (!Array.isArray(result.products?.nodes)) {
      throw new Error("Shopify returned an invalid product list.");
    }

    cachedProducts = {
      products: result.products.nodes,
      expiresAt: Date.now() + cacheDurationMs,
    };
    response.json({ products: cachedProducts.products });
  } catch {
    console.error("Shopify catalog request failed.");
    response.status(502).json({
      error: "Unable to load the catalog from Shopify right now.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(resolve(process.cwd(), "dist")));
    app.use((request, response) => {
      if (request.method === "GET" && request.accepts("html")) {
        response.sendFile(resolve(process.cwd(), "dist", "index.html"));
        return;
      }
      response.status(404).json({ error: "Not found." });
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT ?? 5000);
  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Makeup storefront listening on port ${port}.`);
  });
}

void startServer().catch(() => {
  console.error("The storefront server failed to start.");
  process.exitCode = 1;
});
