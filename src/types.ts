/**
 * @file Centralized type definitions for the application.
 */

export interface User {
    id: string;
    username: string;
    avatarUrl: string;
  }
  
  export interface VersionHistoryItem {
    version: string;
    date: string;
    commitHash: string;
    commitUrl: string;
  }
  
  export interface Spec {
    id: string;
    name: string;
    author: User;
    description: string;
    longDescription: string;
    language: string;
    tags: string[];
    rating: number;
    totalRatings: number;
    version: string;
    lastUpdated: string;
    githubUrl: string;
    tomlContent: string;
    versionHistory: VersionHistoryItem[];
  }
  