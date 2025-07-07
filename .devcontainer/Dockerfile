FROM denoland/deno:bin-2.4.0 AS deno
FROM mcr.microsoft.com/devcontainers/typescript-node:22
COPY --from=deno /deno /usr/local/bin/deno

# === Install tooling ===
USER node

RUN npm install -g @anthropic-ai/claude-code