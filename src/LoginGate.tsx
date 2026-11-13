const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appPath = (path: string) => `${basePath}${path}` || "/";

export default function LoginGate() {
  return (
    <main className="login-gate">
      <div className="login-gate__intro">
        <a href={appPath("/")} className="wordmark">
          <span className="wordmark-main">the makeup counter</span>
          <span className="wordmark-sub">A place to play with color</span>
        </a>
        <p>A little room for you, whenever you’re ready.</p>
      </div>

      <section className="login-gate__card" aria-labelledby="login-gate-title">
        <p className="eyebrow">WELCOME TO THE COUNTER</p>
        <h1 id="login-gate-title">Log in to come in.</h1>
        <p className="login-gate__description">
          Sign in or create an account to enter the makeup shop and game room.
        </p>
        <a className="login-gate__primary" href={appPath("/login")}>Log in</a>
        <p className="login-gate__signup">
          New here? <a href={appPath("/sign-up")}>Create an account</a>
        </p>
      </section>
    </main>
  );
}
