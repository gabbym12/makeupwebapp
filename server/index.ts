import { createServer as createHttpServer } from "node:http";
import express from "express";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";
import { shopifyStorefrontRequest } from "./shopifyStorefrontClient.js";

const PRODUCTS_PER_PAGE = 24;
const PRODUCT_CACHE_TTL_MS = 45_000;
const MAX_CACHED_PAGES = 20;
const app = express();
const httpServer = createHttpServer(app);

type ShopifyProductsResponse = {
  products: {
    nodes: ShopifyProduct[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
  };
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  availableForSale: boolean;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
};

type ProductPage = ShopifyProductsResponse["products"];
const productPageCache = new Map<
  string,
  { value: ProductPage; expiresAt: number }
>();

const PRODUCTS_QUERY = `#graphql
  query Products($after: String) {
    products(first: ${PRODUCTS_PER_PAGE}, after: $after, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        description
        availableForSale
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
          maxVariantPrice {
            amount
            currencyCode
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

app.get("/api/products", async (request, response) => {
  const cursorValue = request.query.cursor;
  const cursor = typeof cursorValue === "string" ? cursorValue : "";
  if (cursor.length > 2048) {
    response.status(400).json({ error: "Invalid product page." });
    return;
  }

  const cacheKey = cursor || "__first_page__";
  const cached = productPageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    response.setHeader("Cache-Control", "private, max-age=30");
    response.json(cached.value);
    return;
  }

  try {
    const data = await shopifyStorefrontRequest<ShopifyProductsResponse>(
      PRODUCTS_QUERY,
      { after: cursor || null },
    );
    if (!Array.isArray(data.products?.nodes) || !data.products?.pageInfo) {
      throw new Error("Shopify returned an invalid product list.");
    }
    const products = data.products;
    productPageCache.set(cacheKey, {
      value: products,
      expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
    });

    for (const [key, entry] of productPageCache) {
      if (entry.expiresAt <= Date.now()) productPageCache.delete(key);
    }
    while (productPageCache.size > MAX_CACHED_PAGES) {
      const oldestKey = productPageCache.keys().next().value;
      if (oldestKey === undefined) break;
      productPageCache.delete(oldestKey);
    }

    response.setHeader("Cache-Control", "private, max-age=30");
    response.json(products);
  } catch (error) {
    console.error("Shopify catalog request failed.");
    response.status(502).json({
      error: "The product list couldn’t be loaded from Shopify. Please try again.",
    });
  }
});

async function start() {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    const distPath = resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.use((request, response, next) => {
      if (request.method !== "GET" || request.path.startsWith("/api/")) {
        next();
        return;
      }
      if (request.accepts("html")) {
        response.sendFile(resolve(distPath, "index.html"));
        return;
      }
      next();
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

void start().catch(() => {
  console.error("The storefront server failed to start.");
  process.exitCode = 1;
});
