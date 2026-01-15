/**
 * Execute a GitHub GraphQL query
 * @param query - The GraphQL query string
 * @returns Promise with the query response
 */
export default async function githubQuery(
  query: string,
): Promise<{ data?: unknown; message?: string; [key: string]: unknown }> {
  if (!process.env.GH_TOKEN) {
    throw new Error('GH_TOKEN environment variable is required');
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${process.env.GH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as { data?: unknown; message?: string; [key: string]: unknown };
}
