# MCP servers for the FoodMe course

This folder documents the MCP (Model Context Protocol) servers the course
connects an agent to, and ships a filled-in **template** for each
(`.mcp.json.example`). Every credential is referenced as an environment
variable — never as a literal value in any file in this repo.

> **`.mcp.json` (without `.example`) must never be committed.** It's already
> covered by the repo's `.gitignore`; copy `.mcp.json.example` to `.mcp.json`
> locally and fill in real values via your shell environment or a local
> `.env` that is also gitignored.

## Atlassian Remote MCP Server (Jira)

Atlassian ships an official, hosted Remote MCP Server that fronts Jira (and
Confluence) — no local process to run.

- **URL:** `https://mcp.atlassian.com/v1/mcp/authv2`
- **Auth:** OAuth 2.1 — the MCP client opens a browser flow the first time it
  connects and Atlassian handles token issuance and refresh from there. There
  is no static API token to put in `.mcp.json`; the entry is just the URL.
- **Scope:** access is governed by the Atlassian account that completes the
  OAuth flow and that account's normal Jira permissions — an agent connected
  this way can only do what the signed-in user could do in the Jira UI.
- **What it exposes for Jira:** search/JQL, fetching issue details, and
  creating/updating issues, described by Atlassian as using the same
  retrieval patterns as Rovo (their own AI features).

Config (`.mcp.json.example` → `atlassian`):

```json
{
  "type": "http",
  "url": "https://mcp.atlassian.com/v1/mcp/authv2"
}
```

Each student authenticates with their own Atlassian account the first time
Claude Code connects to this server — nothing to fill in beyond the URL.

## Xray (Jira test management)

**There is no official Xray MCP server.** A few community-maintained ones
exist, but none are published or supported by the Xray/Idera team, so this
course does not standardize on one. Instead, an agent reaches Xray Cloud the
same way any script would: its REST and GraphQL APIs.

- **Auth:** create an API Key in Jira (**Apps → Xray → API Keys**), which
  gives you a `client_id` / `client_secret` pair. Exchange it for a bearer
  token:

  ```bash
  curl -s -H "Content-Type: application/json" -X POST \
    -d "{\"client_id\":\"$XRAY_CLIENT_ID\",\"client_secret\":\"$XRAY_CLIENT_SECRET\"}" \
    https://xray.cloud.getxray.app/api/v2/authenticate
  ```

  The returned token is a bearer token valid for 24 hours; the API key
  itself doesn't expire.

- **REST v2** (`https://xray.cloud.getxray.app/api/v2/...`) — importing
  execution results (JUnit, Cucumber, native Xray JSON, and others) and
  exporting/importing feature files.
- **GraphQL** (`https://xray.cloud.getxray.app/api/v2/graphql`) — the
  general-purpose way to create and query Tests, Test Sets, Test Plans, and
  Test Executions, including manual test steps. `qa/xray/xray-import.json`
  and `qa/xray/README.md` show the `createTest` mutation shape used for this
  course's starter test repository.

An agent drives Xray via a thin CLI wrapper (`curl` + `jq`, or a short
script) rather than an MCP tool call — document that explicitly to students
so they don't go looking for an `xray` MCP server that doesn't exist.

`XRAY_CLIENT_ID` / `XRAY_CLIENT_SECRET` — environment variables, from the
Xray API Key, never the Atlassian account password.

## Grafana

Grafana Labs publishes an official MCP server, `mcp-grafana`.

- **Repo:** `github.com/grafana/mcp-grafana`
- **Run it** via `uvx mcp-grafana`, a downloaded binary, or Docker:

  ```bash
  docker run --rm -i -e GRAFANA_URL -e GRAFANA_SERVICE_ACCOUNT_TOKEN \
    grafana/mcp-grafana -t stdio
  ```

- **Env vars:** `GRAFANA_URL` (this course: `http://localhost:3002`) and
  `GRAFANA_SERVICE_ACCOUNT_TOKEN` (a Grafana service account token created
  under **Administration → Service accounts** in the running Grafana
  instance — give it only the permissions the tools you plan to use require,
  e.g. dashboard and datasource read access for the Session 7 monitoring
  exercise).
- **What it exposes:** searching/reading dashboards, querying configured
  datasources (this stack: Prometheus and Loki) via PromQL/LogQL, listing
  alerts, and more.

Config (`.mcp.json.example` → `grafana`) points `GRAFANA_URL` at this
project's compose-provisioned Grafana on `:3002`.

## GitHub

The official GitHub MCP server, used for the PR-review workflow and for
students to have an agent read/act on issues and pull requests directly.

- **Hosted (recommended):** `https://api.githubcopilot.com/mcp/`, an HTTP MCP
  server — no local process. Authenticate with a GitHub Personal Access
  Token via the `Authorization: Bearer` header.
- **Local (Docker) alternative:**

  ```bash
  docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
  ```

- **Env var:** `GITHUB_PERSONAL_ACCESS_TOKEN` — a fine-grained PAT scoped to
  the student's fork (contents, issues, pull requests). Never the repo
  owner's token.

## Setting up your own `.mcp.json`

```bash
cp qa/mcp/.mcp.json.example .mcp.json
```

Then export the environment variables each server needs before starting
Claude Code (or put them in a gitignored `.env` your shell loads):

| Variable | Used by |
|---|---|
| `GRAFANA_URL` | Grafana MCP server |
| `GRAFANA_SERVICE_ACCOUNT_TOKEN` | Grafana MCP server |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | GitHub MCP server |
| `XRAY_CLIENT_ID`, `XRAY_CLIENT_SECRET` | Xray REST/GraphQL API (no MCP server) |

The Atlassian server needs no environment variable — it authenticates
interactively via OAuth on first connection.
