import { ClerkProvider, SignIn, SignUp, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Redirect, Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import App from "./App";
import Arcade from "./Arcade";

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const clerkAppearance = {
  theme: shadcn,
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#d65459",
    colorForeground: "#352c2a",
    colorMutedForeground: "#675b55",
    colorDanger: "#a83f49",
    colorBackground: "#fbf7ef",
    colorInput: "#fffdf8",
    colorInputForeground: "#352c2a",
    colorNeutral: "#352c2a",
    fontFamily: '"DM Sans", sans-serif',
    borderRadius: "2px",
  },
  elements: {
    rootBox: { width: "100%", display: "flex", justifyContent: "center" },
    cardBox: { width: "100%", maxWidth: "440px", background: "#fbf7ef", border: "1px solid #e7ddd3", boxShadow: "0 24px 70px rgba(68, 48, 43, .12)" },
    card: { background: "transparent", boxShadow: "none" },
    footer: { background: "transparent", boxShadow: "none" },
    headerTitle: { color: "#352c2a", fontFamily: '"Playfair Display", Georgia, serif', fontSize: "30px", fontWeight: 500, letterSpacing: "-.04em" },
    headerSubtitle: { color: "#675b55", fontFamily: '"DM Sans", sans-serif' },
    socialButtonsBlockButtonText: { color: "#352c2a", fontWeight: 600 },
    formFieldLabel: { color: "#493d39", fontWeight: 600 },
    footerActionLink: { color: "#963b43", fontWeight: 700 },
    footerActionText: { color: "#675b55" },
    dividerText: { color: "#675b55" },
    identityPreviewEditButton: { color: "#963b43" },
    formFieldSuccessText: { color: "#426247" },
    alertText: { color: "#8c353e" },
    logoBox: { marginBottom: "12px" },
    logoImage: { maxHeight: "44px" },
    socialButtonsBlockButton: { background: "#fffdf8", border: "1px solid #d9c9bd", borderRadius: "2px" },
    formButtonPrimary: { background: "#d65459", color: "#fffaf4", borderRadius: "2px", boxShadow: "none" },
    formFieldInput: { background: "#fffdf8", color: "#352c2a", border: "1px solid #d9c9bd", borderRadius: "2px" },
    footerAction: { color: "#675b55" },
    dividerLine: { background: "#ded2c8" },
    alert: { background: "#f3e3de", border: "1px solid #d7b7ae" },
    otpCodeFieldInput: { background: "#fffdf8", color: "#352c2a", border: "1px solid #d9c9bd" },
    formFieldRow: { marginBottom: "16px" },
    main: { gap: "18px" },
  },
};

function HomeRoute() {
  const { isLoaded, isSignedIn } = useUser();
  if (isLoaded && isSignedIn) return <Redirect to="/account" />;
  return <App />;
}

function AccountRoute() {
  const { isLoaded, isSignedIn } = useUser();
  if (!isLoaded) return <div className="auth-route-loading" aria-label="Loading account" />;
  if (!isSignedIn) return <Redirect to="/" />;
  return <App />;
}

function SignInPage() {
  return (
    <main className="auth-page">
      <div className="auth-page__intro">
        <a href="/" className="wordmark"><span className="wordmark-main">the makeup counter</span><span className="wordmark-sub">A place to play with color</span></a>
        <p>A little room for you, whenever you’re ready.</p>
      </div>
      <div className="auth-page__form">
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} forceRedirectUrl={`${basePath}/account`} />
      </div>
    </main>
  );
}

function SignUpPage() {
  return (
    <main className="auth-page">
      <div className="auth-page__intro">
        <a href="/" className="wordmark"><span className="wordmark-main">the makeup counter</span><span className="wordmark-sub">A place to play with color</span></a>
        <p>Make a little room for color.</p>
      </div>
      <div className="auth-page__form">
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} forceRedirectUrl={`${basePath}/account`} />
      </div>
    </main>
  );
}

function ClerkRoutes() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      appearance={clerkAppearance}
      localization={{
        signIn: { start: { title: "Welcome back", subtitle: "Your place at the counter is waiting." } },
        signUp: { start: { title: "Come on in", subtitle: "Create an account and make yourself at home." } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <Switch>
        <Route path="/" component={HomeRoute} />
        <Route path="/account" component={AccountRoute} />
        <Route path="/game" component={Arcade} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route><Redirect to="/" /></Route>
      </Switch>
    </ClerkProvider>
  );
}

export default function AuthApp() {
  return <WouterRouter base={basePath}><ClerkRoutes /></WouterRouter>;
}
