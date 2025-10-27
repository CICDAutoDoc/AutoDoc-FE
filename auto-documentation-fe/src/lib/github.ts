export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  created_at: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubReadme {
  content: string;
  encoding: string;
}

export async function getRepository(
  owner: string,
  repo: string
): Promise<GitHubRepo> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  return response.json();
}

export async function getReadme(
  owner: string,
  repo: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch README: ${response.statusText}`);
  }

  const data: GitHubReadme = await response.json();

  // Decode base64 content
  const decodedContent = Buffer.from(data.content, "base64").toString("utf-8");

  return decodedContent;
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Support formats:
  // https://github.com/owner/repo
  // github.com/owner/repo
  // owner/repo

  const patterns = [
    /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
    /^github\.com\/([^\/]+)\/([^\/]+)\/?$/,
    /^([^\/]+)\/([^\/]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    }
  }

  return null;
}
