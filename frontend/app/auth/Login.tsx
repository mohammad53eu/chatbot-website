import { useState } from "react";
import { Link } from "react-router";

export function meta() {
	return [
		{ title: "Login" },
		{ name: "description", content: "Login to your account" },
	];
}

type LoginPayload = {
	// identifier can be either email or username. Keep backend flexible for Google auth.
	identifier: string;
	password: string;
};

export default function Login() {
	const [form, setForm] = useState<LoginPayload>({ identifier: "", password: "" });
	const [errors, setErrors] = useState<Partial<Record<keyof LoginPayload, string>>>({});
	const [submitting, setSubmitting] = useState(false);

	function validate(values: LoginPayload) {
		const e: Partial<Record<keyof LoginPayload, string>> = {};
		if (!values.identifier.trim()) e.identifier = "Email or username is required";
		if (!values.password) e.password = "Password is required";
		return e;
	}

	async function onSubmit(ev: React.FormEvent) {
		ev.preventDefault();
		const e = validate(form);
		setErrors(e);
		if (Object.keys(e).length) return;

		setSubmitting(true);
		try {
			// TODO: POST to your API, e.g. /api/auth/login
			// await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
			//   .then(r => r.ok ? r.json() : Promise.reject(r));
			console.log("login payload", form);
			// On success, navigate to app home or dashboard
			// navigate("/");
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	}

	function onGoogleSignIn() {
		// In production, redirect to your OAuth start endpoint, e.g. /api/auth/google
		// window.location.href = "/api/auth/google";
		console.log("Google sign-in clicked");
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-medium">Welcome back</h2>
				<p className="text-sm text-gray-500">Use your email/username and password, or continue with Google.</p>
			</div>

			<button
				type="button"
				onClick={onGoogleSignIn}
				className="w-full rounded-md border py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
			>
				Continue with Google
			</button>

			<div className="relative text-center">
				<span className="px-2 text-xs text-gray-500 bg-white dark:bg-gray-900 relative z-10">or</span>
				<div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-800" />
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="identifier">Email or username</label>
					<input
						id="identifier"
						name="identifier"
						autoComplete="username"
						value={form.identifier}
						onChange={(e) => setForm((f) => ({ ...f, identifier: e.target.value }))}
						className="w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
						placeholder="you@example.com or johndoe"
					/>
					{errors.identifier && <p className="text-xs text-red-500">{errors.identifier}</p>}
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="current-password"
						value={form.password}
						onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
						className="w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
						placeholder="••••••••"
					/>
					{errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
				</div>

				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-md bg-amber-500 text-white py-2.5 text-sm font-medium hover:bg-amber-600 disabled:opacity-60"
				>
					{submitting ? "Signing in..." : "Sign in"}
				</button>
			</form>

			<p className="text-sm text-gray-500">
				Don&apos;t have an account? {" "}
				<Link to="/register" className="underline hover:text-amber-500">Create one</Link>
			</p>
		</div>
	);
}

