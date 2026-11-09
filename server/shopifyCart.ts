import { shopifyStorefrontRequest } from "./shopifyStorefrontClient.js";

export type ShopifyCartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    product: {
      title: string;
      featuredImage: {
        url: string;
        altText: string | null;
      } | null;
    };
  };
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  lines: {
    nodes: ShopifyCartLine[];
  };
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
};

type CartPayload = {
  cart: ShopifyCart | null;
  userErrors?: Array<{ message: string }>;
};

const CART_FIELDS = `#graphql
  cart {
    id
    checkoutUrl
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            product {
              title
              featuredImage {
                url
                altText
              }
            }
          }
        }
      }
    }
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
    }
  }
`;

const CART_CREATE = `#graphql
  mutation CartCreate($variantId: ID!, $quantity: Int!) {
    cartCreate(input: { lines: [{ merchandiseId: $variantId, quantity: $quantity }] }) {
      ${CART_FIELDS}
      userErrors { message }
    }
  }
`;

const CART_LINES_ADD = `#graphql
  mutation CartLinesAdd($cartId: ID!, $variantId: ID!, $quantity: Int!) {
    cartLinesAdd(cartId: $cartId, lines: [{ merchandiseId: $variantId, quantity: $quantity }]) {
      ${CART_FIELDS}
      userErrors { message }
    }
  }
`;

const CART_LINES_UPDATE = `#graphql
  mutation CartLinesUpdate($cartId: ID!, $lineId: ID!, $quantity: Int!) {
    cartLinesUpdate(cartId: $cartId, lines: [{ id: $lineId, quantity: $quantity }]) {
      ${CART_FIELDS}
      userErrors { message }
    }
  }
`;

const CART_LINES_REMOVE = `#graphql
  mutation CartLinesRemove($cartId: ID!, $lineId: ID!) {
    cartLinesRemove(cartId: $cartId, lineIds: [$lineId]) {
      ${CART_FIELDS}
      userErrors { message }
    }
  }
`;

const CART_QUERY = `#graphql
  query Cart($cartId: ID!) {
    cart(id: $cartId) {
      id
      checkoutUrl
      lines(first: 100) {
        nodes {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              availableForSale
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      cost {
        subtotalAmount {
          amount
          currencyCode
        }
      }
    }
  }
`;

const CHECKOUT_QUERY = `#graphql
  query CartCheckout($cartId: ID!) {
    cart(id: $cartId) {
      checkoutUrl
    }
  }
`;

export class ShopifyCartError extends Error {}

function requireCart(payload: CartPayload): ShopifyCart {
  const message = payload.userErrors?.map((error) => error.message).filter(Boolean).join(" ");
  if (message) throw new ShopifyCartError(message);
  if (!payload.cart) {
    throw new ShopifyCartError("Shopify could not find that cart. Please start a new cart.");
  }
  return payload.cart;
}

export async function getCart(cartId: string) {
  const data = await shopifyStorefrontRequest<{ cart: ShopifyCart | null }>(
    CART_QUERY,
    { cartId },
  );
  return data.cart;
}

export async function createCart(variantId: string, quantity: number) {
  const data = await shopifyStorefrontRequest<{ cartCreate: CartPayload }>(
    CART_CREATE,
    { variantId, quantity },
  );
  return requireCart(data.cartCreate);
}

export async function addCartLine(
  cartId: string,
  variantId: string,
  quantity: number,
) {
  const data = await shopifyStorefrontRequest<{ cartLinesAdd: CartPayload }>(
    CART_LINES_ADD,
    { cartId, variantId, quantity },
  );
  return requireCart(data.cartLinesAdd);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
) {
  const data = await shopifyStorefrontRequest<{ cartLinesUpdate: CartPayload }>(
    CART_LINES_UPDATE,
    { cartId, lineId, quantity },
  );
  return requireCart(data.cartLinesUpdate);
}

export async function removeCartLine(cartId: string, lineId: string) {
  const data = await shopifyStorefrontRequest<{ cartLinesRemove: CartPayload }>(
    CART_LINES_REMOVE,
    { cartId, lineId },
  );
  return requireCart(data.cartLinesRemove);
}

export async function getCheckoutUrl(cartId: string) {
  const data = await shopifyStorefrontRequest<{
    cart: { checkoutUrl: string } | null;
  }>(CHECKOUT_QUERY, { cartId });
  const checkoutUrl = data.cart?.checkoutUrl;
  if (!checkoutUrl) {
    throw new ShopifyCartError("Shopify couldn’t prepare checkout for this cart.");
  }

  const url = new URL(checkoutUrl);
  if (url.protocol !== "https:") {
    throw new ShopifyCartError("Shopify returned an invalid checkout link.");
  }
  const previewSetting = process.env.SHOPIFY_USE_DEV_STORE_PREVIEW;
  const useDevStorePreview =
    previewSetting === "true" ||
    (previewSetting !== "false" && process.env.NODE_ENV !== "production");
  if (useDevStorePreview) {
    url.searchParams.set("channel", "online_store");
  }
  return url.toString();
}
