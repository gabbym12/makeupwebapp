import { createServer as createHttpServer } from "node:http";
import cors from "cors";
import express from "express";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import { resolve } from "node:path";
import { createServer as createViteServer } from "vite";
import {
  addCartLine,
  createCart,
  getCart,
  getCheckoutUrl,
  removeCartLine,
  ShopifyCartError,
  updateCartLine,
} from "./shopifyCart.js";
import { shopifyStorefrontRequest } from "./shopifyStorefrontClient.js";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware.js";

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
  variants: {
    nodes: Array<{
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string; currencyCode: string };
    }>;
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
        variants(first: 20) {
          nodes {
            id
            title
            availableForSale
            price {
              amount
              currencyCode
            }
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

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  clerkMiddleware((request) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(request) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

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

const MAX_CART_QUANTITY = 99;

function isShopifyId(value: unknown, type: "Cart" | "CartLine" | "ProductVariant") {
  return (
    typeof value === "string" &&
    value.length <= 2048 &&
    value.startsWith(`gid://shopify/${type}/`)
  );
}

function readCartInput(request: express.Request, response: express.Response) {
  const { cartId, lineId, variantId, quantity } = request.body ?? {};
  if (
    cartId !== undefined &&
    !isShopifyId(cartId, "Cart")
  ) {
    response.status(400).json({ error: "This cart is no longer available. Please start a new cart." });
    return null;
  }
  if (
    lineId !== undefined &&
    !isShopifyId(lineId, "CartLine")
  ) {
    response.status(400).json({ error: "That item is no longer available in your cart." });
    return null;
  }
  if (
    variantId !== undefined &&
    !isShopifyId(variantId, "ProductVariant")
  ) {
    response.status(400).json({ error: "Please choose an available product option." });
    return null;
  }
  if (
    quantity !== undefined &&
    (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_QUANTITY)
  ) {
    response.status(400).json({ error: `Choose a quantity from 1 to ${MAX_CART_QUANTITY}.` });
    return null;
  }
  return { cartId, lineId, variantId, quantity } as {
    cartId?: string;
    lineId?: string;
    variantId?: string;
    quantity?: number;
  };
}

function sendCartError(response: express.Response, error: unknown, fallback: string) {
  if (error instanceof ShopifyCartError) {
    response.status(422).json({ error: error.message });
    return;
  }
  console.error("Shopify cart request failed.");
  response.status(502).json({ error: fallback });
}

app.get("/api/cart", async (request, response) => {
  const cartId = request.query.cartId;
  if (!isShopifyId(cartId, "Cart")) {
    response.status(400).json({ error: "This cart is no longer available. Please start a new cart." });
    return;
  }
  try {
    const cart = await getCart(cartId as string);
    if (!cart) {
      response.status(404).json({ error: "This cart is no longer available. Please start a new cart." });
      return;
    }
    response.setHeader("Cache-Control", "no-store");
    response.json(cart);
  } catch (error) {
    sendCartError(response, error, "Your cart couldn’t be loaded. Please try again.");
  }
});

app.post("/api/cart", async (request, response) => {
  const input = readCartInput(request, response);
  if (!input || !input.variantId || !input.quantity) {
    if (input) response.status(400).json({ error: "Choose a product option before adding it." });
    return;
  }
  try {
    const cart = input.cartId
      ? await addCartLine(input.cartId, input.variantId, input.quantity)
      : await createCart(input.variantId, input.quantity);
    response.setHeader("Cache-Control", "no-store");
    response.json(cart);
  } catch (error) {
    sendCartError(response, error, "That item couldn’t be added. Check availability and try again.");
  }
});

app.patch("/api/cart", async (request, response) => {
  const input = readCartInput(request, response);
  if (!input) return;
  if (!input.cartId || !input.lineId || !input.quantity) {
    response.status(400).json({ error: "Choose a cart item and a quantity to update." });
    return;
  }
  try {
    const cart = await updateCartLine(input.cartId, input.lineId, input.quantity);
    response.setHeader("Cache-Control", "no-store");
    response.json(cart);
  } catch (error) {
    sendCartError(response, error, "That quantity couldn’t be updated. Please try again.");
  }
});

app.delete("/api/cart", async (request, response) => {
  const input = readCartInput(request, response);
  if (!input) return;
  if (!input.cartId || !input.lineId) {
    response.status(400).json({ error: "Choose a cart item to remove." });
    return;
  }
  try {
    const cart = await removeCartLine(input.cartId, input.lineId);
    response.setHeader("Cache-Control", "no-store");
    response.json(cart);
  } catch (error) {
    sendCartError(response, error, "That item couldn’t be removed. Please try again.");
  }
});

app.post("/api/cart/checkout", async (request, response) => {
  const input = readCartInput(request, response);
  if (!input) return;
  if (!input.cartId) {
    response.status(400).json({ error: "Add an item before checking out." });
    return;
  }
  try {
    response.setHeader("Cache-Control", "no-store");
    response.json({ checkoutUrl: await getCheckoutUrl(input.cartId) });
  } catch (error) {
    sendCartError(response, error, "Checkout couldn’t be opened. Please try again.");
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
