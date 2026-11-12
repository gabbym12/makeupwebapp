import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight, LockKeyhole, LogOut, Sparkles, UserRound } from "lucide-react";
import "./AuthGate.css";

type SiteUser = {
  id: string;
  username: string;
};

type AuthMode = "signup" | "login";

type AuthGateProps = {
  children: ReactNode;
};

export default function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<SiteUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [logoutError, setLogoutError] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Account check failed.");
        const result = (await response.json()) as { user?: SiteUser | null };
        return result.user ?? null;
      })
      .then((signedInUser) => {
        if (active) setUser(signedInUser);
      })
      .catch(() => {
        if (active) setSessionError("We couldn’t check your sign-in. Please try again.");
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function signOut() {
    setIsSigningOut(true);
    setLogoutError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Sign-out failed.");
      setUser(null);
    } catch {
      setLogoutError("We couldn’t sign you out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isCheckingSession) {
    return (
      <main className="auth-loading" aria-live="polite">
        <span className="auth-loading__mark" aria-hidden="true">
          <Sparkles size={19} />
        </span>
        <p>Opening your counter…</p>
      </main>
    );
  }

  if (sessionError) {
    return (
      <main className="auth-loading auth-loading--error">
        <span className="auth-loading__mark" aria-hidden="true">
          <LockKeyhole size={18} />
        </span>
        <p>{sessionError}</p>
        <button type="button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </main>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  return (
    <>
      <div className="auth-session-bar">
        <div className="auth-session-bar__inner">
          <span>
            <UserRound size={14} aria-hidden="true" />
            Signed in as <strong>{user.username}</strong>
          </span>
          <div className="auth-session-bar__actions">
            {logoutError && <small role="alert">{logoutError}</small>}
            <button type="button" onClick={signOut} disabled={isSigningOut}>
              <LogOut size={14} aria-hidden="true" />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      </div>
      {children}
    </>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: SiteUser) => void }) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json().catch(() => null)) as
        | { user?: SiteUser; error?: string }
        | null;

      if (!response.ok || !result?.user) {
        setError(result?.error ?? "We couldn’t finish that. Please try again.");
        return;
      }

      setPassword("");
      onAuthenticated(result.user);
    } catch {
      setError("We couldn’t connect. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function chooseMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setPassword("");
  }

  return (
    <main className="auth-gate">
      <div className="auth-gate__ribbon">A WELCOMING PLACE TO EXPLORE MAKEUP · FIND YOUR KIND OF GLOW</div>
      <div className="auth-gate__layout">
        <section className="auth-card" aria-labelledby="auth-title">
          <a className="auth-card__wordmark" href="/" aria-label="The Makeup Counter home">
            <span>the makeup counter</span>
            <small>A PLACE TO PLAY WITH COLOR</small>
          </a>

          <p className="auth-card__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            YOUR LITTLE BEAUTY PLACE
          </p>
          <h1 id="auth-title">
            {mode === "signup" ? (
              <>Come on in, <em>glow.</em></>
            ) : (
              <>Welcome <em>back.</em></>
            )}
          </h1>
          <p className="auth-card__intro">
            Sign in or make an account to explore the makeup shop and play the games.
          </p>

          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              type="button"
              role="tab"
              aria-selected={mode === "signup"}
              className={mode === "signup" ? "is-active" : ""}
              onClick={() => chooseMode("signup")}
            >
              Sign up
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={mode === "login" ? "is-active" : ""}
              onClick={() => chooseMode("login")}
            >
              Log in
            </button>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <label htmlFor="auth-username">Username</label>
            <span className="auth-input">
              <UserRound size={17} aria-hidden="true" />
              <input
                id="auth-username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                maxLength={24}
                pattern="[A-Za-z0-9_-]{3,24}"
                title="Use 3–24 letters, numbers, underscores, or dashes."
                placeholder="Choose a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </span>
            <label htmlFor="auth-password">Password</label>
            <span className="auth-input">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="auth-password"
                name="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={8}
                maxLength={128}
                placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </span>

            {error && (
              <p className="auth-form__error" role="alert">
                {error}
              </p>
            )}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "One moment…"
                : mode === "signup"
                  ? "Create my account"
                  : "Log in"}
              {!isSubmitting && <ArrowRight size={17} aria-hidden="true" />}
            </button>
          </form>

          <p className="auth-card__footnote">
            No email needed. Keep your password safe—there’s no email reset.
          </p>
        </section>

        <aside className="auth-art" aria-label="A colorful makeup still life">
          <div className="auth-art__sun" />
          <div className="auth-art__label">A LITTLE ROOM TO PLAY</div>
          <div className="auth-art__compact">
            <span className="auth-art__shade auth-art__shade--coral" />
            <span className="auth-art__shade auth-art__shade--rose" />
            <span className="auth-art__shade auth-art__shade--plum" />
            <span className="auth-art__shade auth-art__shade--peach" />
          </div>
          <div className="auth-art__brush" />
          <div className="auth-art__caption">
            <span>YOUR ROUTINE</span>
            <span>YOUR RULES</span>
          </div>
          <p className="auth-art__bottom">MAKEUP · GAMES · A LITTLE COLOR</p>
        </aside>
      </div>
    </main>
  );
}
