import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  // HMR WebSocket setup for the Manus sandbox proxy environment.
  //
  // Problem: Vite resolves the hmr.host to an IP and tries to bind the
  // HMR WebSocket server on that IP.  In the Manus sandbox the public IP
  // is not bindable, so we must bind on 0.0.0.0 while still telling the
  // browser to connect through the correct proxy hostname.
  //
  // Solution: Use a custom Vite plugin that patches the @vite/client script
  // at serve time to replace the socketHost with the correct proxy URL.
  const instanceId = process.env.MANUS_INSTANCE_ID;
  const codeServerDomain = process.env.CODE_SERVER_DOMAIN || "us2.manus.computer";
  const hmrProxyHost = instanceId
    ? `24678-${instanceId}.${codeServerDomain}`
    : null;

  // Plugin: rewrite @vite/client to use the correct proxy WebSocket URL.
  const hmrClientPatchPlugin = hmrProxyHost
    ? {
        name: "manus-hmr-client-patch",
        transform(code: string, id: string) {
          if (!id.includes("@vite/client")) return;
          // Replace the socketHost template literal so the browser connects
          // to wss://24678-xxx.manus.computer:443/ instead of 0.0.0.0:443.
          return code
            .replace(
              /const socketHost = `\$\{[^}]+\}:\$\{[^}]+\}\$\{[^}]+\}`;/,
              `const socketHost = \`${hmrProxyHost}/\`;`
            )
            .replace(
              /const directSocketHost = [^;]+;/,
              `const directSocketHost = \"${hmrProxyHost}/\";`
            );
        },
      }
    : null;

  const serverOptions = {
    middlewareMode: true,
    hmr: {
      // Bind on all interfaces — never on a specific IP.
      host: "0.0.0.0",
      port: 24678,
      // clientPort tells the browser to use port 443 (HTTPS proxy).
      clientPort: 443,
      protocol: "wss" as const,
    },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
    plugins: [
      ...((viteConfig as any).plugins ?? []),
      ...(hmrClientPatchPlugin ? [hmrClientPatchPlugin] : []),
    ],
  });

  // Intercept @vite/client to patch the HMR socketHost with the correct
  // Manus proxy hostname.  Vite uses res.end() (not res.send()) to serve
  // this script, so we override res.end on the response object.
  if (hmrProxyHost) {
    app.use("/@vite/client", (req, res, next) => {
      const originalEnd = res.end.bind(res);
      (res as any).end = function (chunk: any, ...args: any[]) {
        if (typeof chunk === "string" && chunk.includes("socketHost")) {
          chunk = chunk
            .replace(
              /const socketHost = `[^`]+`;/,
              `const socketHost = \`${hmrProxyHost}/\`;`
            )
            .replace(
              /const directSocketHost = "[^"]+";/,
              `const directSocketHost = "${hmrProxyHost}/";`
            );
        } else if (Buffer.isBuffer(chunk)) {
          let str = chunk.toString("utf8");
          if (str.includes("socketHost")) {
            str = str
              .replace(
                /const socketHost = `[^`]+`;/,
                `const socketHost = \`${hmrProxyHost}/\`;`
              )
              .replace(
                /const directSocketHost = "[^"]+";/,
                `const directSocketHost = "${hmrProxyHost}/";`
              );
            chunk = Buffer.from(str, "utf8");
          }
        }
        return originalEnd(chunk, ...args);
      };
      next();
    });
  }

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
