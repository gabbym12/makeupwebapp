import { useClerk, useUser } from "@clerk/react";

type AuthControlProps = { className?: string };
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const appPath = (path: string) => `${basePath}${path}` || "/";

export default function AuthControl({ className = "" }: AuthControlProps) {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) return <span className={`account-control account-control--loading ${className}`} aria-hidden="true" />;

  if (!user) {
    return <a className={`account-control account-control--link ${className}`} href={appPath("/login")}>Log in</a>;
  }

  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const email = user.primaryEmailAddress?.emailAddress;

  return (
    <div className={`account-control account-control--signed-in ${className}`}>
      <a className="account-control__identity" href={appPath("/account")} aria-label={`My account${name ? `: ${name}` : email ? `: ${email}` : ""}`}>
        <span>My account</span>
        {(name || email) && <small>{name || email}</small>}
      </a>
      <button className="account-control__sign-out" type="button" onClick={() => void signOut({ redirectUrl: appPath("/") })}>
        Sign out
      </button>
    </div>
  );
}
