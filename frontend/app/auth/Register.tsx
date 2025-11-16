import { useState } from "react";
import { Link } from "react-router";

export function meta() {
	return [
		{ title: "Register" },
		{ name: "description", content: "Create a new account" },
	];
}

type IdentifierType = "email" | "username";

type RegisterPayload = {
	// Choose to register with either email or username. Keep shape compatible with Google auth.
	identifierType: IdentifierType;
	email?: string;
	username?: string;
	password: string;
};

export default function Register() {
	const [form, setForm] = useState<RegisterPayload>({
		identifierType: "email",
		email: "",
		username: "",
		password: "",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof RegisterPayload, string>>>({});
	const [submitting, setSubmitting] = useState(false);

	function validate(values: RegisterPayload) {
		const e: Partial<Record<keyof RegisterPayload, string>> = {};
		const isEmail = values.identifierType === "email";

		if (isEmail) {
			const email = (values.email ?? "").trim();
			if (!email) e.email = "Email is required";
			else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
		} else {
			const username = (values.username ?? "").trim();
			if (!username) e.username = "Username is required";
			else if (username.length < 3) e.username = "Username must be at least 3 characters";
		}

		if (!values.password) e.password = "Password is required";
		else if (values.password.length < 8) e.password = "Password must be at least 8 characters";

		return e;
	}

	async function onSubmit(ev: React.FormEvent) {
		ev.preventDefault();
		const e = validate(form);
		setErrors(e);
		if (Object.keys(e).length) return;

		setSubmitting(true);
		try {
			// Prepare backend-friendly payload
			const payload = {
				identifierType: form.identifierType,
				identifier: form.identifierType === "email" ? form.email : form.username,
				password: form.password,
			};

			// TODO: POST to your API, e.g. /api/auth/register
			// await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
			//   .then(r => r.ok ? r.json() : Promise.reject(r));
			console.log("register payload", payload);

			// On success, navigate to login or auto-login
			// navigate("/login");
		} catch (err) {
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	}

	function onGoogleSignUp() {
		// In production, redirect to your OAuth start endpoint, e.g. /api/auth/google
		// window.location.href = "/api/auth/google";
		console.log("Google sign-up clicked");
	}

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-lg font-medium">Create your account</h2>
				<p className="text-sm text-gray-500">Choose email or username, then set a password. You can also continue with Google.</p>
			</div>

			<button
				type="button"
				onClick={onGoogleSignUp}
				className="w-full rounded-md border py-2.5 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
			>
				Continue with Google
			</button>

			<div className="relative text-center">
				<span className="px-2 text-xs text-gray-500 bg-white dark:bg-gray-900 relative z-10">or</span>
				<div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-gray-200 dark:bg-gray-800" />
			</div>

			<form onSubmit={onSubmit} className="space-y-4">
				<div className="flex items-center gap-3 text-sm">
					<span className="text-gray-600">Register with:</span>
					<label className="inline-flex items-center gap-1">
						<input
							type="radio"
							name="identifierType"
							value="email"
							checked={form.identifierType === "email"}
							onChange={() => setForm((f) => ({ ...f, identifierType: "email" }))}
						/>
						Email
					</label>
					<label className="inline-flex items-center gap-1">
						<input
							type="radio"
							name="identifierType"
							value="username"
							checked={form.identifierType === "username"}
							onChange={() => setForm((f) => ({ ...f, identifierType: "username" }))}
						/>
						Username
					</label>
				</div>

				{form.identifierType === "email" ? (
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="email">Email</label>
						<input
							id="email"
							name="email"
							type="email"
							autoComplete="email"
							value={form.email}
							onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
							className="w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
							placeholder="you@example.com"
						/>
						{errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
					</div>
				) : (
					<div className="space-y-2">
						<label className="text-sm font-medium" htmlFor="username">Username</label>
						<input
							id="username"
							name="username"
							autoComplete="username"
							value={form.username}
							onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
							className="w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
							placeholder="johndoe"
						/>
						{errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
					</div>
				)}

				<div className="space-y-2">
					<label className="text-sm font-medium" htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autoComplete="new-password"
						value={form.password}
						onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
						className="w-full rounded-md border px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-400"
						placeholder="At least 8 characters"
					/>
					{errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
				</div>

				<button
					type="submit"
					disabled={submitting}
					className="w-full rounded-md bg-amber-500 text-white py-2.5 text-sm font-medium hover:bg-amber-600 disabled:opacity-60"
				>
					{submitting ? "Creating account..." : "Create account"}
				</button>
			</form>

			<p className="text-sm text-gray-500">
				Already have an account? {" "}
				<Link to="/login" className="underline hover:text-amber-500">Sign in</Link>
			</p>
		</div>
	);
}

// Backend payloads (for reference):
// Login:   { identifier: string; password: string }
// Register: { identifierType: "email"|"username"; identifier: string; password: string }
// With Google OAuth, user records should support nullable password and a provider field.

