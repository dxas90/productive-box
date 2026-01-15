/**
 * Type definitions for productive-box
 */

export interface Repository {
  name: string;
  owner: string;
}

export interface RepositoryInfo {
  name: string;
  owner: {
    login: string;
  };
  isFork: boolean;
}

export interface CommitEdge {
  node: {
    committedDate: string;
  };
}

export interface CommitHistoryResponse {
  data?: {
    repository?: {
      defaultBranchRef?: {
        target?: {
          history?: {
            edges: CommitEdge[];
          };
        };
      };
    };
  };
  message?: string;
}

export interface UserInfoResponse {
  data?: {
    viewer?: {
      login: string;
      id: string;
    };
  };
  message?: string;
}

export interface ContributedRepoResponse {
  data?: {
    user?: {
      repositoriesContributedTo?: {
        nodes: RepositoryInfo[];
      };
    };
  };
  message?: string;
}

export interface TimeOfDay {
  label: string;
  commits: number;
}

export interface GistFile {
  [filename: string]: {
    filename: string;
    content: string;
  };
}

export interface EnvironmentConfig {
  GH_TOKEN: string;
  GIST_ID: string;
  TIMEZONE?: string;
}
