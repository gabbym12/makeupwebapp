import { useEffect, useState } from "react";
import { ArrowRight, ArrowUp, Flower2, Menu, X } from "lucide-react";
import heroImage from "../attached_assets/generated_images/beauty-still-life.png";

type Product = {
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

const tickerLines = [
  "Makeup for your real-life routine",
  "A little color, your way",
  "A counter made for curious beauty lovers",
];

function formatPrice(amount: string, currencyCode: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(Number(amount));
  } catch {
    return `${currencyCode} ${amount}`;
  }
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [catalogState, setCatalogState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadToken, setReloadToken] = useState(0);

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setCatalogState("loading");
      try {
        const response = await fetch("/api/products", { signal: controller.signal });
        if (!response.ok) throw new Error("Catalog request failed");
        const result = (await response.json()) as { products: Product[] };
        setProducts(result.products);
        setCatalogState("ready");
      } catch {
        if (!controller.signal.aborted) setCatalogState("error");
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [reloadToken]);

  return (
    <>
      <div className="announcement">
        A new beauty counter is taking shape <span aria-hidden="true">&nbsp;·&nbsp;</span> More soon
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
          {catalogState === "ready" && products.length > 0 ? (
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
                      <div className="product-image-placeholder" aria-hidden="true">
                        <Flower2 size={48} strokeWidth={0.8} />
                      </div>
                    )}
                    <span className={`product-availability${product.availableForSale ? "" : " is-unavailable"}`}>
                      {product.availableForSale ? "Available" : "Sold out"}
                    </span>
                  </div>
                  <div className="product-card-copy">
                    <div className="product-title-row">
                      <h3>{product.title}</h3>
                      <span className="product-price">
                        {formatPrice(
                          product.priceRange.minVariantPrice.amount,
                          product.priceRange.minVariantPrice.currencyCode,
                        )}
                      </span>
                    </div>
                    {product.description && <p>{product.description}</p>}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-panel" aria-live="polite">
              <div className="empty-art" aria-hidden="true">
                <div className="empty-orbit" />
                <Flower2 className="empty-flower" strokeWidth={0.8} />
                <span className="empty-sticker">A new<br />chapter</span>
              </div>
              <div className="empty-copy">
                <span className="status-line">
                  <span className={`status-dot${catalogState === "error" ? " is-error" : ""}`} />
                  {catalogState === "loading" ? "Loading the counter" : catalogState === "error" ? "Catalog unavailable" : "Store connected"}
                </span>
                <h3>
                  {catalogState === "loading"
                    ? "A moment while we look."
                    : catalogState === "error"
                      ? "We couldn’t reach the shop."
                      : "We’re setting out the first things."}
                </h3>
                <p>
                  {catalogState === "loading"
                    ? "We’re checking the connected Shopify catalog for what’s available."
                    : catalogState === "error"
                      ? "The product list didn’t load from Shopify. Try again in a moment."
                      : "Our shelves are still being arranged. There aren’t any products here just yet, but this little beauty counter is getting ready to welcome you."}
                </p>
                {catalogState === "error" ? (
                  <button className="retry-button" type="button" onClick={() => setReloadToken((token) => token + 1)}>
                    Try again <ArrowRight size={14} aria-hidden="true" />
                  </button>
                ) : (
                  <p className="subtle-note">
                    {catalogState === "loading" ? "Product availability comes directly from the store." : "Check back soon. Good things take a little choosing."}
                  </p>
                )}
              </div>
            </div>
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
        <span className="footer-note">A new counter is taking shape. See you soon.</span>
        <a className="footer-top" href="#top">Back to top <ArrowUp size={14} aria-hidden="true" /></a>
      </footer>
    </>
  );
}
