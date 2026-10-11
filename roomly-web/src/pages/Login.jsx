import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login } from "../services/authService.js";
function Login({ currentUser, onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        document.title = "Roomly - Login";
    }, []);
    if (currentUser) {
        return <Navigate to={currentUser.role === "admin" ? "/admin" : "/rooms"} replace/>;
    }
    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage("");
        setIsSubmitting(true);
        try {
            const user = await login(email, password);
            onLogin(user);
            navigate(user.role === "admin" ? "/admin" : "/rooms", { replace: true });
        }
        catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Could not sign in. Try again.");
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (<main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md space-y-7 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
        <header>
          <p className="text-sm font-bold text-violet-700">Roomly</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage meeting room bookings.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {errorMessage}
            </p>)}
          <div className="space-y-2">
            <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700">
              Email
            </label>
            <input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
          </div>
          <div className="space-y-2">
            <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700">
              Password
            </label>
            <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"/>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600">
          New to Roomly? <Link to="/register" className="font-semibold text-violet-700 underline">Create an employee account</Link>
        </p>

        {import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_SERVICES === "true" && (<details className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold">Development demo accounts</summary>
            <p className="mt-2">Employee: employee@roomly.local / Roomly123!</p>
            <p>Admin: admin@roomly.local / Admin123!</p>
          </details>)}
      </section>
    </main>);
}
export default Login;
