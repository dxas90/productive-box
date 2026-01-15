# 📌✨ productive-box

[![Language: TypeScript](https://img.shields.io/badge/language-typescript-blue?style=flat-square)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D24-brightgreen?style=flat-square)](https://nodejs.org/)
[![License](https://img.shields.io/github/license/dxas90/productive-box?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/dxas90/productive-box?style=flat-square)](https://github.com/dxas90/productive-box/stargazers)

![Screenshot](https://user-images.githubusercontent.com/25841814/79395484-5081ae80-7fac-11ea-9e27-ac91472e31dd.png)

**Are you an early 🐤 or a night 🦉?**
**When are you most productive during the day?**
**Let's check out in your GitHub gist!**

---

> This project is a modernized fork of [maxam2017/productive-box](https://github.com/maxam2017/productive-box), inspired by the [awesome-pinned-gists](https://github.com/matchai/awesome-pinned-gists) collection.

## ✨ Features

- 🕐 Analyzes your GitHub commit history by time of day
- 📊 Generates beautiful Unicode bar charts
- 📌 Updates a pinned gist on your GitHub profile
- 🔄 Runs automatically via GitHub Actions
- 🌍 Supports custom timezones
- 🚀 Built with modern TypeScript and Node.js 24

## 🏗️ Tech Stack

- **Runtime:** Node.js 24+
- **Language:** TypeScript with strict mode
- **Package Manager:** pnpm 10
- **Code Quality:** Biome (linting & formatting)
- **API:** GitHub GraphQL API via Octokit
- **CI/CD:** GitHub Actions

## 🚀 Setup

### Prerequisites

- A GitHub account
- Node.js 24+ (if running locally)
- pnpm 10+ (if running locally)

### Quick Start

#### 1. Create a GitHub Gist

Create a new **public** GitHub Gist at <https://gist.github.com/>

The gist can contain any initial content - it will be overwritten by the action.

#### 2. Generate a GitHub Token

Create a personal access token at <https://github.com/settings/tokens/new> with the following scopes:

- `gist` - to update your gist
- `repo` - to access your commit history

⚠️ **Security Note:** The `repo` scope is required to access commit timestamps from your repositories. The action only reads commit data and never modifies your repositories.

#### 3. Fork This Repository

Fork this repository to your GitHub account.

#### 4. Enable GitHub Actions

1. Go to the **Actions** tab in your forked repository
2. Click the "I understand my workflows, go ahead and enable them" button

#### 5. Configure Secrets and Variables

Go to **Settings** > **Secrets and variables** > **Actions** and add:

**Repository Secrets:**

| Name | Value | Description |
|------|-------|-------------|
| `GH_TOKEN` | Your personal access token | Token with `gist` and `repo` scopes |
| `GIST_ID` | Your gist ID | Found in gist URL: `gist.github.com/username/GIST_ID` |

**Repository Variables:**

| Name | Value | Description |
|------|-------|-------------|
| `TIMEZONE` | Your timezone | e.g., `America/New_York`, `Europe/London`, `Asia/Tokyo` |

**Configuration Screenshots:**

| Repository Secrets | Repository Variables |
| ------------------ | -------------------- |
| ![Repository Secrets](https://github.com/maxam2017/productive-box/assets/25841814/53a1ddfa-17f3-40c0-b8db-afd674d616e6) | ![Repository Variables](https://github.com/maxam2017/productive-box/assets/25841814/836f8374-ae13-4617-9e18-62ed3eb8e179) |

#### 6. Run the Workflow

You can either:

- **Wait** for the scheduled run (daily at 00:00 UTC)
- **Manually trigger** the workflow:
  1. Go to **Actions** tab
  2. Select "Update gist" workflow
  3. Click "Run workflow" button

#### 7. Pin Your Gist

[Pin the gist to your GitHub profile](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/customizing-your-profile/pinning-items-to-your-profile) to show off your productivity patterns! 📌

## 📊 How It Works

1. **Fetch User Data:** Queries GitHub GraphQL API for your user ID
2. **Get Repositories:** Retrieves all repositories you've contributed to (excluding forks)
3. **Analyze Commits:** Fetches commit history and categorizes by time of day:
   - 🌞 **Morning:** 6:00 AM - 11:59 AM
   - 🌆 **Daytime:** 12:00 PM - 5:59 PM
   - 🌃 **Evening:** 6:00 PM - 11:59 PM
   - 🌙 **Night:** 12:00 AM - 5:59 AM
4. **Generate Chart:** Creates Unicode bar chart visualization
5. **Update Gist:** Updates your gist with the latest statistics

## 🛠️ Local Development

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/productive-box.git
cd productive-box

# Install dependencies
pnpm install
```

### Configuration

Create a `.env` file:

```env
GH_TOKEN=your_github_token_here
GIST_ID=your_gist_id_here
TIMEZONE=America/New_York
```

### Running

```bash
# Development mode
pnpm dev

# Build
pnpm build

# Type checking
pnpm typecheck

# Linting & formatting
pnpm check
pnpm format
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
| -------- | -------- | ------- | ----------- |
| `GH_TOKEN` | ✅ Yes | - | GitHub personal access token |
| `GIST_ID` | ✅ Yes | - | ID of the gist to update |
| `TIMEZONE` | ❌ No | `UTC` | Timezone for time calculations |

### Workflow Schedule

The workflow runs automatically on:

- **Schedule:** Daily at 00:00 UTC (configured in [schedule.yml](.github/workflows/schedule.yml))
- **Push to master:** After successful build
- **Manual trigger:** Via workflow_dispatch

To change the schedule, edit the cron expression in [`.github/workflows/schedule.yml`](.github/workflows/schedule.yml):

```yaml
schedule:
  - cron: "0 0 * * *"  # Daily at midnight UTC
```

## 🏗️ Project Structure

```text
productive-box/
├── src/
│   ├── index.ts           # Main orchestration logic
│   ├── types.ts           # TypeScript type definitions
│   ├── generateBarChart.ts # Unicode bar chart generator
│   ├── githubQuery.ts     # GitHub GraphQL client
│   └── queries.ts         # GraphQL query templates
├── .github/
│   └── workflows/         # GitHub Actions workflows
├── dist/                  # Compiled output (git-ignored)
├── action.yml            # GitHub Action definition
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript configuration
└── biome.json           # Biome linter/formatter config
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

- Use TypeScript with strict mode
- Follow the existing code style (enforced by Biome)
- Add proper error handling
- Update documentation for new features
- Test your changes locally before submitting

## 📝 License

[MIT License](LICENSE) © 2020-present maxam2017

## 🙏 Acknowledgments

- Original project by [maxam2017](https://github.com/maxam2017/productive-box)
- Inspired by [matchai/awesome-pinned-gists](https://github.com/matchai/awesome-pinned-gists)
- Bar chart implementation from [matchai/waka-box](https://github.com/matchai/waka-box)

## 📮 Support

If you have any questions or issues, please [open an issue](https://github.com/dxas90/productive-box/issues) on GitHub.

---

Made with ❤️ and TypeScript
