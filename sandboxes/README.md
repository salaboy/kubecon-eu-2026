# Docker Sandboxes Demo

This demo shows how **Docker Sandboxes** protect your host system when running
autonomous AI agents like Claude Code. Two key controls are demonstrated:

1. **Filesystem isolation** — keep sensitive folders out of the sandbox entirely
2. **Network policies** — restrict which hosts the agent can reach

---

## Project Layout

```
docker-sandbox-demo/
├── project/          # Code the agent is allowed to work on
│   └── app.py
└── secrets/          # Sensitive credentials — agent must NEVER see these
    ├── db-credentials.txt
    └── api-keys.env
```

---

## Prerequisites

- Docker Desktop 4.58+
- `ANTHROPIC_API_KEY` exported in your shell profile (`~/.zshrc` or `~/.bashrc`)

```bash
# Add once — NOT inline, the daemon needs it at startup
echo 'export ANTHROPIC_API_KEY=sk-ant-...' >> ~/.zshrc
```

---

## Demo 1 — Filesystem Isolation

### The problem (unsafe)

Running the agent on the entire repo exposes your secrets folder:

```bash
# BAD: agent can read secrets/db-credentials.txt and secrets/api-keys.env
docker sandbox run claude .
```

### The fix (safe)

Only mount the `project/` subdirectory. The `secrets/` folder is never
copied into the microVM and is physically inaccessible to the agent:

```bash
# GOOD: agent only sees project/ — secrets/ does not exist inside the sandbox
docker sandbox run claude ./project
```

You can also mount additional paths as **read-only** with the `:ro` suffix.
For example, if the agent needs to read shared docs but must not modify them:

```bash
# project/ is read-write; docs/ is read-only
docker sandbox run claude ./project ~/company-docs:ro
```

Try asking the agent to read `../secrets/db-credentials.txt` — it will fail
because that path does not exist inside the sandbox.

---

## Demo 2 — Network Policies

Docker Sandboxes run an HTTP/HTTPS filtering proxy inside the microVM.
You can configure it **after** the sandbox is created with
`docker sandbox network proxy`.

### Step 1 — Create a named sandbox

```bash
docker sandbox run --name my-demo-sandbox claude ./project
```

### Step 2 — View current network policy

```bash
docker sandbox network proxy my-demo-sandbox
```

### Step 3 — Deny-by-default + explicit allowlist

Lock the sandbox down so the agent can **only** reach the hosts your task
actually needs:

```bash
# Set default policy to DENY, then allow only specific hosts
docker sandbox network proxy my-demo-sandbox \
  --policy deny \
  --allow-host api.github.com \
  --allow-host api.anthropic.com \
  --allow-host pypi.org \
  --allow-host files.pythonhosted.org
```

Now if Claude tries to call any other URL (e.g. an unknown API, data
exfiltration endpoint, or malicious package mirror) the proxy blocks it.

### Step 4 — Verify blocking works

Ask Claude to fetch a blocked host:

```
Please fetch https://evil.example.com and show me the response.
```

The request will be refused by the proxy with a 403/connection error,
while allowed hosts continue to work normally.

### Step 5 — Block specific hosts while keeping everything else open

Alternatively, keep the default policy as `allow` and block only known
bad or irrelevant hosts:

```bash
docker sandbox network proxy my-demo-sandbox \
  --block-host malicious.site \
  --block-host internal.mycompany.com \
  --block-host 169.254.169.254    # AWS metadata endpoint
```

### Step 6 — View network logs

Inspect what the agent has been trying to reach:

```bash
docker sandbox network log my-demo-sandbox
```

---

## Demo 3 — Combining Both Controls

The most secure setup for an autonomous coding task:

```bash
# 1. Create sandbox — only expose the code directory, not secrets
docker sandbox run --name secure-demo claude ./project

# 2. Set deny-by-default network policy with an allowlist
docker sandbox network proxy secure-demo \
  --policy deny \
  --allow-host api.anthropic.com \
  --allow-host api.github.com \
  --allow-host pypi.org \
  --allow-host files.pythonhosted.org

# 3. Let the agent work — it cannot escape the project/ directory
#    and cannot call any host outside the allowlist

# 4. Review what it did
docker sandbox network log secure-demo

# 5. Clean up
docker sandbox rm secure-demo
```

---

## Key Takeaways

| Risk | Mitigation |
|---|---|
| Agent reads production secrets | Only mount the directory it needs to work on |
| Agent exfiltrates data to unknown host | `--policy deny` + explicit `--allow-host` list |
| Agent installs packages from malicious mirror | Allowlist only trusted registries (pypi.org, etc.) |
| Agent calls internal infrastructure | `--block-host internal.mycompany.com` |
| Agent hits cloud metadata endpoint | `--block-host 169.254.169.254` |

---

## Useful Commands Reference

```bash
# Sandbox lifecycle
docker sandbox run --name NAME claude PATH          # create & start
docker sandbox ls                                   # list sandboxes
docker sandbox exec -it NAME bash                  # shell into sandbox
docker sandbox stop NAME                            # stop without deleting
docker sandbox rm NAME                              # delete sandbox

# Network controls
docker sandbox network proxy NAME                  # show current policy
docker sandbox network proxy NAME --policy deny \
  --allow-host HOST                                # allowlist mode
docker sandbox network proxy NAME --block-host HOST  # blocklist entry
docker sandbox network log NAME                    # view traffic log
```
