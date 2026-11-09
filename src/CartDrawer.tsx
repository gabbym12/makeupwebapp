import { Minus, Plus, ShoppingBag, X } from "lucide-react";

export type CartLine = {
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

export type Cart = {
  id: string;
  checkoutUrl: string;
  lines: { nodes: CartLine[] };
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
};

type CartDrawerProps = {
  cart: Cart | null;
  open: boolean;
  busy: boolean;
  error: string;
  checkoutBusy: boolean;
  onClose: () => void;
  onQuantityChange: (line: CartLine, quantity: number) => void;
  onRemove: (line: CartLine) => void;
  onCheckout: () => void;
};

function formatMoney(amount: string, currencyCode: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(Number(amount));
  } catch {
    return `${currencyCode} ${amount}`;
  }
}

export default function CartDrawer({
  cart,
  open,
  busy,
  error,
  checkoutBusy,
  onClose,
  onQuantityChange,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  if (!open) return null;
  const lines = cart?.lines.nodes ?? [];
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const hasUnavailableItems = lines.some((line) => !line.merchandise.availableForSale);

  return (
    <div className="cart-layer">
      <button className="cart-scrim" type="button" aria-label="Close your bag" onClick={onClose} />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-heading">
          <div>
            <p className="eyebrow">Your picks</p>
            <h2 id="cart-title">Your bag <span>({itemCount})</span></h2>
          </div>
          <button className="cart-close" type="button" onClick={onClose} aria-label="Close your bag">
            <X size={20} strokeWidth={1.7} />
          </button>
        </div>

        {error && <p className="cart-error" role="alert">{error}</p>}

        {lines.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={32} strokeWidth={1.2} aria-hidden="true" />
            <h3>Your bag is taking a little break.</h3>
            <p>Find something you love at the counter and it’ll show up here.</p>
            <button className="catalog-button" type="button" onClick={onClose}>Keep exploring</button>
          </div>
        ) : (
          <>
            <div className="cart-lines" aria-busy={busy}>
              {lines.map((line) => (
                <article className="cart-line" key={line.id}>
                  <div className="cart-line-image">
                    {line.merchandise.product.featuredImage ? (
                      <img
                        src={line.merchandise.product.featuredImage.url}
                        alt={line.merchandise.product.featuredImage.altText || line.merchandise.product.title}
                      />
                    ) : (
                      <ShoppingBag size={23} strokeWidth={1.2} aria-hidden="true" />
                    )}
                  </div>
                  <div className="cart-line-info">
                    <h3>{line.merchandise.product.title}</h3>
                    {line.merchandise.title !== "Default Title" && (
                      <p className="cart-line-variant">{line.merchandise.title}</p>
                    )}
                    {!line.merchandise.availableForSale && (
                      <p className="cart-line-unavailable" role="alert">
                        This option is no longer available. Remove it to continue.
                      </p>
                    )}
                    <p className="cart-line-price">
                      {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                    </p>
                    <div className="cart-line-controls">
                      <div className="quantity-control" aria-label={`Quantity for ${line.merchandise.product.title}`}>
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.merchandise.product.title}`}
                          disabled={busy || line.quantity <= 1}
                          onClick={() => onQuantityChange(line, line.quantity - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span aria-live="polite">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.merchandise.product.title}`}
                          disabled={busy || line.quantity >= 99}
                          onClick={() => onQuantityChange(line, line.quantity + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <button
                        className="cart-remove"
                        type="button"
                        disabled={busy}
                        onClick={() => onRemove(line)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-summary">
              <p>
                <span>Subtotal</span>
                <strong>
                  {formatMoney(cart!.cost.subtotalAmount.amount, cart!.cost.subtotalAmount.currencyCode)}
                </strong>
              </p>
              <small>Shipping and taxes are calculated at Shopify checkout.</small>
              <button
                className="checkout-button"
                type="button"
                onClick={onCheckout}
                disabled={busy || checkoutBusy || lines.length === 0 || hasUnavailableItems}
              >
                {checkoutBusy ? "Opening Shopify checkout…" : "Continue to checkout"}
              </button>
              <small className="checkout-note">Secure checkout hosted by Shopify</small>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
