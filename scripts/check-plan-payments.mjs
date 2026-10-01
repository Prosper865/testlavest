// Resolve the app's TypeScript aliases for Node's built-in type stripping (Node 22.15+).
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) specifier = new URL(`../${specifier.slice(2)}.ts`, import.meta.url).href;
    else if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      const url = new URL(`${specifier}.ts`, context.parentURL);
      if (existsSync(fileURLToPath(url))) specifier = url.href;
    }
    return nextResolve(specifier, context);
  },
});
await import(process.argv.includes("--portfolio") ? "./check-portfolio.ts" : process.argv.includes("--profits") ? "./check-user-profit.ts" : process.argv.includes("--withdrawals") ? "./check-withdrawals.ts" : "./check-plan-payments.ts");
