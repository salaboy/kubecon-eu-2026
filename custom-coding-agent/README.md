# Custom Coding Agent — Docker Agent Demo

A minimal example of a **local multi-agent setup** using [Docker Agent](https://docs.docker.com/ai/docker-agent/).

Two specialized agents collaborate using **different models**:

| Agent | Model | Role |
|---|---|---|
| `troubleshoot-issue` | `claude-opus-4-6` | Diagnoses bugs, identifies root causes |
| `fixer` | `claude-sonnet-4-6` | Implements the targeted fix |

## How it works

1. You describe a problem (or point at the broken file) to the **troubleshoot-issue** root agent.
2. It analyzes the issue and delegates the fix to the **fixer** sub-agent.
3. The fixer applies the minimal change and reports back.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Docker Agent enabled
- An Anthropic API key

## Run

```bash
export ANTHROPIC_API_KEY=<your-key>
docker agent run agents.yaml
```

Then describe the problem at the prompt, for example:

```
> Look at broken_app.py and fix all the bugs you find
```

## Files

- `agents.yaml` — agent team definition
- `broken_app.py` — sample buggy Python script for the agents to work on
