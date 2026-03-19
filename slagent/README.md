# slagent / slaude

[slagent](https://github.com/sttts/slagent) is a Go library (with a CLI called `slaude`) that streams Claude Code sessions to Slack threads. Teams can observe, comment, and guide Claude's work in real-time.

## Install

```bash
brew tap sttts/slagent https://github.com/sttts/slagent
brew install sttts/slagent/slaude
```

## Setup

Authenticate with Slack:

```bash
slaude auth
```

## Demo

Start a new Claude session streaming to the `#vibe-with-claude` channel:

```bash
slaude start -c vibe-with-claude
```

Join an existing thread in `#vibe-with-claude` with a topic:

```bash
slaude start -c vibe-with-claude -- -p "create a simple Go web server"
```
