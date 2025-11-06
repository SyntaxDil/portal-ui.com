# Migration Plan: JackedDnb to /Sites/JackedDnb

## Scope
Transition hosting of the Jacked site under the existing portal at this subfolder while keeping links and SEO intact.

## Approach
1. Stand up placeholder under `site/` and serve locally
2. Define redirects and routing strategy (docs/routing-notes.md)
3. Prepare server config sample for target host
4. Deploy placeholder
5. Incrementally swap in real content/assets

## Risks
- Redirect loops or incorrect base paths
- Mixed content (http/https) issues
- Cache invalidation delays

## Timeline
- Day 1: Placeholder + routing
- Day 2: Infra + deploy
- Day 3+: Content rollout, verification
