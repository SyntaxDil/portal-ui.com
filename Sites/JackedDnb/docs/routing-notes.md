# Routing Notes

Adjust paths based on where this subfolder is exposed on the main domain.

## SPA-style fallback
If needed, use a fallback to index.html for unknown routes, while allowing normal file requests.

- IIS: see `infra/web.config`
- Apache: see `infra/apache.htaccess`
- Nginx: see `infra/nginx.conf`

## Redirect mapping (examples)
| From | To | Type |
|------|----|------|
| /jacked | /Sites/JackedDnb/ | 302 |
| /jacked/* | /Sites/JackedDnb/$1 | 301 |

Update with the actual canonical paths you choose.
