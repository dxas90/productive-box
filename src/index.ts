#!/usr/bin/env node
import { Octokit } from '@octokit/rest';
import { config } from 'dotenv';

import generateBarChart from './generateBarChart.js';
import githubQuery from './githubQuery.js';
import { createCommittedDateQuery, createContributedRepoQuery, userInfoQuery } from './queries.js';
import type {
  CommitHistoryResponse,
  ContributedRepoResponse,
  Repository,
  RepositoryInfo,
  TimeOfDay,
  UserInfoResponse,
} from './types.js';

/**
 * Load environment variables from .env file
 */
config({ path: ['.env'] });

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const required = ['GH_TOKEN', 'GIST_ID'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Get user information from GitHub
 */
async function getUserInfo(): Promise<{ username: string; id: string }> {
  try {
    const response = (await githubQuery(userInfoQuery)) as UserInfoResponse;

    if (response.message === 'Bad credentials') {
      throw new Error('Invalid GitHub token. Please check your GH_TOKEN');
    }

    const { login: username, id } = response?.data?.viewer ?? {};

    if (!username || !id) {
      throw new Error('Unable to fetch user information');
    }

    console.log(`✓ Fetched user info: ${username} (${id})`);
    return { username, id };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get username and id: ${message}`);
  }
}

/**
 * Get repositories contributed to by the user
 */
async function getContributedRepos(username: string): Promise<Repository[]> {
  try {
    const contributedRepoQuery = createContributedRepoQuery(username);
    const response = (await githubQuery(contributedRepoQuery)) as ContributedRepoResponse;

    if (response.message === 'Bad credentials') {
      throw new Error('Invalid GitHub token. Please check your GH_TOKEN');
    }

    const repos: Repository[] =
      response?.data?.user?.repositoriesContributedTo?.nodes
        ?.filter((repoInfo: RepositoryInfo) => !repoInfo?.isFork)
        .map((repoInfo: RepositoryInfo) => ({
          name: repoInfo?.name,
          owner: repoInfo?.owner?.login,
        })) ?? [];

    console.log(`✓ Found ${repos.length} contributed repositories`);
    return repos;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get contributed repos: ${message}`);
  }
}

/**
 * Analyze commit times and categorize by time of day
 */
async function analyzeCommitTimes(
  id: string,
  repos: Repository[],
): Promise<{ morning: number; daytime: number; evening: number; night: number }> {
  const timezone = process.env.TIMEZONE || 'UTC';
  console.log(`✓ Using timezone: ${timezone}`);

  let morning = 0; // 6:00 - 11:59
  let daytime = 0; // 12:00 - 17:59
  let evening = 0; // 18:00 - 23:59
  let night = 0; // 0:00 - 5:59

  // Fetch commit histories with continue-on-failure pattern
  const committedTimeResponses: CommitHistoryResponse[] = [];
  let successCount = 0;
  let failureCount = 0;

  for (const { name, owner } of repos) {
    try {
      const response = (await githubQuery(createCommittedDateQuery(id, name, owner))) as CommitHistoryResponse;
      committedTimeResponses.push(response);
      successCount++;
    } catch (error) {
      failureCount++;
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠ Failed to fetch commits for ${owner}/${name}: ${message}`);
      // Continue processing other repos
    }
  }

  console.log(`✓ Fetched commit history: ${successCount} succeeded, ${failureCount} failed`);

  // Process commit times
  for (const committedTimeResponse of committedTimeResponses) {
    const edges = committedTimeResponse?.data?.repository?.defaultBranchRef?.target?.history?.edges;

    if (!edges) continue;

    for (const edge of edges) {
      const committedDate = edge?.node?.committedDate;
      if (!committedDate) continue;

      const timeString = new Date(committedDate).toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: timezone,
      });
      const hour = Number.parseInt(timeString.split(':')[0], 10);

      // Categorize by time of day
      if (hour >= 6 && hour < 12) morning++;
      else if (hour >= 12 && hour < 18) daytime++;
      else if (hour >= 18 && hour < 24) evening++;
      else if (hour >= 0 && hour < 6) night++;
    }
  }

  return { morning, daytime, evening, night };
}

/**
 * Generate gist content from commit statistics
 */
function generateGistContent(stats: { morning: number; daytime: number; evening: number; night: number }): string[] {
  const { morning, daytime, evening, night } = stats;
  const sum = morning + daytime + evening + night;

  if (sum === 0) {
    throw new Error('No commits found. Make sure your repositories have commits.');
  }

  console.log(`✓ Analyzed ${sum} total commits`);

  const timeOfDay: TimeOfDay[] = [
    { label: '🌞 Morning', commits: morning },
    { label: '🌆 Daytime', commits: daytime },
    { label: '🌃 Evening', commits: evening },
    { label: '🌙 Night', commits: night },
  ];

  const lines = timeOfDay.map((period) => {
    const percent = (period.commits / sum) * 100;
    const commitText = `${period.commits.toString().padStart(5)} commits`;
    const barChart = generateBarChart(percent, 21);
    const percentText = `${percent.toFixed(1).padStart(5)}%`;

    return `${period.label.padEnd(10)} ${commitText.padEnd(14)} ${barChart} ${percentText}`;
  });

  return lines;
}

/**
 * Update GitHub Gist with productivity statistics
 */
async function updateGist(content: string[]): Promise<void> {
  const gistId = process.env.GIST_ID;
  if (!gistId) {
    throw new Error('GIST_ID environment variable is required');
  }

  const octokit = new Octokit({ auth: `token ${process.env.GH_TOKEN}` });

  try {
    // Get existing gist
    const gist = await octokit.gists.get({ gist_id: gistId });

    if (!gist.data.files || Object.keys(gist.data.files).length === 0) {
      throw new Error('No files found in the gist');
    }

    const filename = Object.keys(gist.data.files)[0];
    const morningDaytime = content[0].split(' ').pop();
    const eveningNight = content[2].split(' ').pop();
    const isMorningPerson = Number.parseFloat(morningDaytime || '0') > Number.parseFloat(eveningNight || '0');

    // Update gist
    await octokit.gists.update({
      gist_id: gistId,
      files: {
        [filename]: {
          filename: isMorningPerson ? "I'm an early 🐤" : "I'm a night 🦉",
          content: content.join('\n'),
        },
      },
    });

    console.log('✓ Successfully updated gist 🎉');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to update gist: ${message}`);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting productive-box...\n');

  try {
    // Validate environment
    validateEnvironment();

    // Step 1: Get user information
    const { username, id } = await getUserInfo();

    // Step 2: Get contributed repositories
    const repos = await getContributedRepos(username);

    if (repos.length === 0) {
      throw new Error('No contributed repositories found');
    }

    // Step 3: Analyze commit times
    const stats = await analyzeCommitTimes(id, repos);

    // Step 4: Generate gist content
    const content = generateGistContent(stats);

    // Step 5: Update gist
    await updateGist(content);

    console.log('\n✅ All done!');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`\n❌ Error: ${message}`);
    process.exit(1);
  }
}

// Run main function
main();
