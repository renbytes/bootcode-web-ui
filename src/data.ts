/**
 * @file Mock data for development.
 * In a real application, this would come from an API.
 */
import { Spec } from './types';

export const mockSpecs: Spec[] = [
  {
    id: 'pyspark-attribution-model',
    name: 'pyspark-attribution-model',
    author: {
      id: 'user1',
      username: 'data-dave',
      avatarUrl: 'https://placehold.co/40x40/232a31/white?text=DD',
    },
    description: 'A PySpark pipeline for marketing attribution analysis in e-commerce.',
    longDescription: 'This specification outlines a complete, production-grade PySpark pipeline designed for marketing attribution analysis. It follows the composable map-reduce pattern for efficiency and testability, making it ideal for large-scale e-commerce datasets. The model supports last-touch attribution and can be extended for other models.',
    language: 'pyspark',
    tags: ['pyspark', 'ecommerce', 'marketing', 'attribution', 'big-data'],
    rating: 4.5,
    totalRatings: 128,
    version: '1.2.3',
    lastUpdated: '2 weeks ago',
    githubUrl: 'https://github.com/example/pyspark-attribution',
    tomlContent: `
language = "pyspark"
project_type = "ecommerce_attribution"
description = "A PySpark pipeline for marketing attribution analysis."

[project]
name = "pyspark-attribution-project"
version = "1.2.3"

[[datasets]]
name = "ad_impressions"
description = "Records of which users saw which ads and when."
schema_or_sample = "impression_id STRING, user_id STRING"
    `.trim(),
    versionHistory: [
      { version: '1.2.3', date: '2025-07-21', commitHash: 'a1b2c3d', commitUrl: '#' },
      { version: '1.2.2', date: '2025-07-18', commitHash: 'e4f5g6h', commitUrl: '#' },
      { version: '1.1.0', date: '2025-06-30', commitHash: 'i7j8k9l', commitUrl: '#' },
      { version: '1.0.0', date: '2025-06-01', commitHash: 'm0n1p2q', commitUrl: '#' },
    ],
  },
  // Add more mock specs here to populate the list
];
