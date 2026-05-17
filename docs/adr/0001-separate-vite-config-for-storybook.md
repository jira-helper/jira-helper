# Separate Vite config for Storybook

Storybook was inheriting the extension's root Vite pipeline, including extension-specific plugins and runtime assumptions that are valid for extension builds but unstable in Storybook dev/test mode. We decided to keep Storybook on its own Vite config (`.storybook/vite.config.ts`) and explicitly point Storybook to it from `.storybook/main.ts`, so Storybook runs with only the config it actually needs.

This isolates Storybook from extension-only behavior, removes environment-coupled failures (including noisy Vite overlay/runtime issues during screenshot and story execution), and makes local/CI behavior more deterministic across machines.

## Consequences

- Storybook config is now an explicit boundary and must be maintained separately from the root `vite.config.ts`.
- Shared essentials (aliases and compatible build options) should be mirrored intentionally, not inherited implicitly.
