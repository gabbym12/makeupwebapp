import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, Flower2, Menu, X } from "lucide-react";
import heroImage from "../attached_assets/generated_images/beauty-still-life.png";

type Product = {
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

type ProductPage = {
  nodes: Product[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
};

const tickerLines = [
  "Makeup for your real-life routine",
  "A little color, your way",
  "A counter made for curious beauty lovers",
];

function formatPrice(product: Product) {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  try {
    const format = (amount: string, currencyCode: string) =>
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currencyCode,
      }).format(Number(amount));
    const minimum = format(minVariantPrice.amount, minVariantPrice.currencyCode);

    if (minVariantPrice.amount === maxVariantPrice.amount) return minimum;
    return `From ${minimum}`;
  } catch {
    const minimum = `${minVariantPrice.currencyCode} ${minVariantPrice.amount}`;
    return minVariantPrice.amount === maxVariantPrice.amount
      ? minimum
      : `From ${minimum}`;
  }
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [pageInfo, setPageInfo] = useState<ProductPage["pageInfo"]>({
    hasNextPage: false,
    endCursor: null,
  });
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "error">("loading");
  const [catalogError, setCatalogError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setCatalogState("loading");
      setCatalogError("");
      setProducts([]);
      setPageInfo({ hasNextPage: false, endCursor: null });

      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        const data = (await response.json()) as ProductPage | { error?: string };
        if (!response.ok) {
          throw new Error("error" in data ? data.error : undefined);
        }

        const page = data as ProductPage;
        setProducts(page.nodes);
        setPageInfo(page.pageInfo);
        setCatalogState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setCatalogError(
          error instanceof Error && error.message
            ? error.message
            : "The product list couldn’t be loaded from Shopify. Please try again.",
        );
        setCatalogState("error");
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [retryCount]);

  async function loadMoreProducts() {
    if (!pageInfo.endCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const params = new URLSearchParams({ cursor: pageInfo.endCursor });
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = (await response.json()) as ProductPage | { error?: string };
      if (!response.ok) {
        throw new Error("error" in data ? data.error : undefined);
      }

      const page = data as ProductPage;
      setProducts((current) => [...current, ...page.nodes]);
      setPageInfo(page.pageInfo);
    } catch (error) {
      setLoadMoreError(
        error instanceof Error && error.message
          ? error.message
          : "More products couldn’t be loaded. Please try again.",
      );
    } finally {
      setLoadingMore(false);
    }
  }

  return (
    <>
      <div className="announcement">
        A welcoming place to explore makeup <span aria-hidden="true">&nbsp;·&nbsp;</span> Find your kind of glow
      </div>
      <header className="site-header" id="top">
        <a className="wordmark" href="#top" onClick={closeMenu} aria-label="The Makeup Counter, home">
          <span className="wordmark-main">the makeup counter</span>
          <span className="wordmark-sub">A place to play with color</span>
        </a>

        <nav id="main-navigation" className={`nav-links${menuOpen ? " is-open" : ""}`} aria-label="Main navigation">
          <a href="#counter" onClick={closeMenu}>The counter</a>
          <a href="#our-approach" onClick={closeMenu}>Our approach</a>
          <a href="#footer" onClick={closeMenu}>A note from us</a>
        </nav>
        <span className="header-note">Everyday beauty, thoughtfully found</span>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} strokeWidth={1.6} /> : <Menu size={21} strokeWidth={1.6} />}
        </button>
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">A fresh face for your everyday</p>
            <h1 id="hero-title">Find your<br />kind of <em>glow.</em></h1>
            <p className="hero-description">
              The makeup you reach for, and the shades you didn’t know you were looking for.
              Come explore at your own pace.
            </p>
            <a className="primary-link" href="#counter">
              Explore the counter <ArrowRight size={15} aria-hidden="true" />
            </a>
          </div>
          <div className="hero-art">
            <img
              className="hero-image"
              src={heroImage}
              alt="An editorial arrangement of a makeup compact and beauty tools with peach, pink, and butter-yellow color."
            />
            <div className="art-caption" aria-hidden="true">Your routine<br />your rules</div>
            <span className="hero-index" aria-hidden="true">A little room to play · 01</span>
          </div>
        </section>

        <div className="ticker" aria-label="Makeup for your real-life routine. A little color, your way. A counter made for curious beauty lovers.">
          <div className="ticker-track" aria-hidden="true">
            {[...tickerLines, ...tickerLines].map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}<span className="ticker-dot" />
              </span>
            ))}
          </div>
        </div>

        <section className="catalog" id="counter" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Take a look around</p>
              <h2 id="catalog-title">The counter</h2>
            </div>
            <p className="heading-aside">A considered edit for wherever your day takes you.</p>
          </div>
          {catalogState === "loading" && (
            <div className="catalog-state" role="status" aria-live="polite">
              <span className="loading-spinner" aria-hidden="true" />
              <p>Looking through the counter…</p>
            </div>
          )}
          {catalogState === "error" && (
            <div className="catalog-state catalog-state-error" role="alert">
              <h3>We couldn’t reach the counter.</h3>
              <p>{catalogError}</p>
              <button
                className="catalog-button"
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
              >
                Try again
              </button>
            </div>
          )}
          {catalogState === "ready" && products.length === 0 && (
            <div className="empty-panel">
              <div className="empty-art" aria-hidden="true">
                <div className="empty-orbit" />
                <Flower2 className="empty-flower" strokeWidth={0.8} />
                <span className="empty-sticker">A new<br />chapter</span>
              </div>
              <div className="empty-copy">
                <span className="status-line"><span className="status-dot" /> Shopify connected</span>
                <h3>There’s nothing on the counter just yet.</h3>
                <p>
                  Products will appear here once they’re available on the Shopify storefront.
                  Your shop is ready whenever you are.
                </p>
              </div>
            </div>
          )}
          {catalogState === "ready" && products.length > 0 && (
            <>
              <div className="product-grid">
                {products.map((product) => (
                  <article className="product-card" key={product.id}>
                    <div className="product-image-wrap">
                      {product.featuredImage ? (
                        <img
                          className="product-image"
                          src={product.featuredImage.url}
                          alt={product.featuredImage.altText || product.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="product-image-fallback" aria-hidden="true">
                          <Flower2 size={58} strokeWidth={0.8} />
                        </div>
                      )}
                      <span className={`product-availability${product.availableForSale ? "" : " is-sold-out"}`}>
                        {product.availableForSale ? "Available" : "Sold out"}
                      </span>
                    </div>
                    <div className="product-copy">
                      <div className="product-title-row">
                        <h3>{product.title}</h3>
                        <span className="product-price">{formatPrice(product)}</span>
                      </div>
                      <p className="product-description">
                        {product.description || "Details coming soon."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
              {pageInfo.hasNextPage && (
                <div className="catalog-more">
                  {loadMoreError && <p className="catalog-more-error" role="alert">{loadMoreError}</p>}
                  <button
                    className="catalog-button"
                    type="button"
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading more…" : loadMoreError ? "Try again" : "Show more"}
                    {!loadingMore && <ArrowRight size={15} aria-hidden="true" />}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <section className="story" id="our-approach" aria-labelledby="story-title">
          <div className="story-mark" aria-hidden="true"><span>you,</span></div>
          <div className="story-copy">
            <p className="eyebrow">A softer kind of beauty shop</p>
            <h2 id="story-title">Your face.<br />Your pace.</h2>
            <p>
              Makeup can be a five-minute ritual, a favorite red lip, or a playful detour.
              We’re making a welcoming place to find what feels like you—one everyday favorite at a time.
            </p>
            <p className="story-small">No rush. No rules. Just room to explore.</p>
          </div>
        </section>
      </main>

      <footer className="footer" id="footer">
        <a className="wordmark" href="#top" aria-label="Back to the top">
          <span className="wordmark-main">the makeup counter</span>
          <span className="wordmark-sub">A place to play with color</span>
        </a>
        <span className="footer-note">Thoughtful everyday beauty. See you soon.</span>
        <a className="footer-top" href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
      </footer>
    </>
  );
}
