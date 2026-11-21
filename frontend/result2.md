~~.\\src\\app\\applications\\page.tsx  line 185: if (typeof window !== "undefined" \&\& !localStorage.getItem("sahay\_access\_token")) {~~

~~.\\src\\app\\dashboard\\page.tsx  line 41: if (typeof window !== "undefined" \&\& !localStorage.getItem("sahay\_access\_token")) {~~

~~.\\src\\app\\documents\\page.tsx  line 72: if (typeof window !== "undefined" \&\& !localStorage.getItem("sahay\_access\_token")) {~~

~~.\\src\\app\\schemes\\page.tsx  line 69: const seen = localStorage.getItem("sahay\_tour\_seen");~~

~~.\\src\\app\\stocks\\page.tsx  line 86: if (typeof window !== "undefined" \&\& !localStorage.getItem("sahay\_access\_token")) {~~

~~.\\src\\app\\twin\\page.tsx  line 102: if (typeof window !== "undefined" \&\& !localStorage.getItem("sahay\_access\_token")) {~~

~~.\\src\\components\\ui\\OnboardingTour.tsx  line 106: localStorage.setItem(storageKey, "true");~~

~~.\\src\\components\\ui\\OnboardingTour.tsx  line 118: localStorage.setItem(storageKey, "true");~~

~~.\\src\\components\\ui\\SchemeMissingActionList.tsx  line 47: // Initialize and load saved state from browser localStorage on mount~~

~~.\\src\\components\\ui\\SchemeMissingActionList.tsx  line 51: const saved = localStorage.getItem(storageKey);~~

~~.\\src\\components\\ui\\SchemeMissingActionList.tsx  line 71: // Fallback if localStorage is inaccessible~~

~~.\\src\\components\\ui\\SchemeMissingActionList.tsx  line 79: localStorage.setItem(storageKey, JSON.stringify(updated));~~

~~.\\src\\lib\\api.ts  line 92: // Attach token if present in localStorage in browser environment~~

~~.\\src\\lib\\api.ts  line 94: const token = localStorage.getItem("sahay\_access\_token");~~

~~.\\src\\lib\\api.ts  line 96: headers.set("Authorization", `Bearer ${token}`);~~

~~.\\src\\lib\\api.ts  line 261: const res = await fetchApi<AuthToken>("/api/v1/auth/login", {~~

~~.\\src\\lib\\api.ts  line 265: if (typeof window !== "undefined" \&\& res.access\_token) {~~

~~.\\src\\lib\\api.ts  line 266: localStorage.setItem("sahay\_access\_token", res.access\_token);~~

~~.\\src\\lib\\api.ts  line 267: localStorage.setItem("sahay\_user", JSON.stringify(res.user));~~

~~.\\src\\lib\\api.ts  line 288: if (typeof window !== "undefined" \&\& res.access\_token) {~~

~~.\\src\\lib\\api.ts  line 289: localStorage.setItem("sahay\_access\_token", res.access\_token);~~

~~.\\src\\lib\\api.ts  line 290: localStorage.setItem("sahay\_user", JSON.stringify(res.user));~~

~~.\\src\\lib\\api.ts  line 302: localStorage.removeItem("sahay\_access\_token");~~

~~.\\src\\lib\\api.ts  line 303: localStorage.removeItem("sahay\_user");~~

~~.\\src\\lib\\api.ts  line 323: const existingToken = localStorage.getItem("sahay\_access\_token");~~

~~.\\src\\lib\\api.ts  line 327: return auth.access\_token;~~

~~.\\src\\lib\\api.ts  line 469: const token = typeof window !== "undefined" ? localStorage.getItem("sahay\_access\_token") : null;~~

~~.\\src\\lib\\api.ts  line 472: headers.set("Authorization", `Bearer ${token}`);~~

~~.\\src\\lib\\i18n.ts  line 1136: const stored = localStorage.getItem("sahay\_lang") as SupportedLanguage;~~

~~.\\src\\lib\\i18n.ts  line 1146: localStorage.setItem("sahay\_lang", lang);~~

~~.\\src\\types\\index.ts  line 51: access\_token: string;~~



