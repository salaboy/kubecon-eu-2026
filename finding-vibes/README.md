# Finding Vibes: Navigating Claude Code Sessions

When working with Claude Code across multiple projects, sessions accumulate as JSONL files in `~/.claude/projects/`, making it hard to find and resume the right conversation. This section covers two tools that solve this problem from different angles: **cc-session** (CLI) and **Argus** (VS Code).

## cc-session - CLI Session Manager

[cc-session](https://github.com/rhuss/cc-session) is a Rust-based CLI tool that lets you search, browse, and resume Claude Code sessions. It handles 2,000+ sessions in under 500ms.

### Features

- **Real-time search** across project names, git branches, and message text - just start typing
- **Conversation viewer** with syntax-highlighted code blocks, markdown tables, and in-conversation search (`/`)
- **Time filtering** with `--since 7d` or `--last 20`
- **Auto-detects terminal theme** (override with `--dark`/`--light`)
- **One-key resume**: press Enter to copy `cd '<path>' && claude -r <session-id>` to your clipboard

### Install

```bash
# macOS
brew install rhuss/tap/cc-session

# Linux/macOS (installer script)
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/rhuss/cc-session/releases/latest/download/cc-session-installer.sh | sh
```

### Quick Demo

```bash
# Browse your last 20 Claude Code sessions, pick one, and resume it
cc-session --last 20
```

Use arrow keys to navigate, type to filter, Enter to copy the resume command to your clipboard, then paste it in your terminal to jump right back into the conversation.

### Key Bindings

| Key | Action |
|-----|--------|
| Up/Down | Navigate sessions |
| Type | Start filtering |
| Enter | Open viewer / copy resume command |
| Space/PageDown | Scroll down in viewer |
| `/` | Search within conversation |
| `n`/`N` | Next/previous search match |
| Esc | Clear filter / go back / quit |

---

## Argus - VS Code Session Debugger

[Argus](https://marketplace.visualstudio.com/items?itemName=argus-claude.argus-claude) is a VS Code extension that analyzes Claude Code sessions with detailed insights, cost analysis, and performance dashboards.

### Features

- **Automatic session discovery** from `~/.claude/projects/`
- **8-tab analysis dashboard**: Overview, Analysis, Cost, Performance, Flow, Context, Steps, Insights
- **Cost tracking**: token breakdown, cache hit ratios, model attribution, spending graphs
- **Performance analysis**: efficiency scoring, wasted cost calculations, bottleneck identification
- **Flow visualization**: interactive dependency graphs showing file operations and step relationships
- **Live monitoring**: watch sessions in real-time as Claude Code executes
- **Built-in rules**: detects duplicate reads, unused operations, retry loops, failed tools, and context pressure

### Install

Search for **Argus** in the VS Code Extensions Marketplace, or install from the command line:

```bash
code --install-extension argus-claude.argus-claude
```

### Quick Start

1. Open VS Code with Argus installed
2. Click the Argus icon in the Activity Bar (left sidebar)
3. Sessions appear automatically - click any session to analyze

### Configuration

```json
{
  "argus.scanDepth": 5,    // Directory scan depth (default: 5)
  "argus.language": "en"   // UI language: "en" or "tr"
}
```

### Commands

Open the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- `Argus: Refresh Sessions` - Manually refresh the session list
- `Argus: Open Session Detail` - View specific session analysis
