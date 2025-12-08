/**
 * GitHub Gitignore API client with local caching
 *
 * Fetches gitignore templates from GitHub's official API with:
 * - Local file caching (7-day TTL)
 * - ETag-based conditional requests
 * - Fallback to bundled templates on network errors
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { getBundledTemplate, isBundledTemplate } from "./bundled-templates.js";

// ============================================================================
// Constants
// ============================================================================

const GITHUB_API_BASE = "https://api.github.com/gitignore/templates";
const CACHE_DIR_NAME = ".agent-foreman/gitignore-cache";
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// ============================================================================
// Types
// ============================================================================

interface GitignoreApiResponse {
  name: string;
  source: string;
}

interface CachedTemplate {
  name: string;
  source: string;
  etag?: string;
  cachedAt: number;
}

interface CachedTemplateList {
  templates: string[];
  etag?: string;
  cachedAt: number;
}

export interface FetchResult {
  source: string;
  fromCache: boolean;
  fallback: boolean;
}

// ============================================================================
// Cache Directory Management
// ============================================================================

/**
 * Get the cache directory path
 */
export function getCacheDir(): string {
  return join(homedir(), CACHE_DIR_NAME);
}

/**
 * Ensure the cache directory exists
 */
function ensureCacheDir(): void {
  const cacheDir = getCacheDir();
  if (!existsSync(cacheDir)) {
    mkdirSync(cacheDir, { recursive: true });
  }
}

/**
 * Get the cache file path for a template
 */
function getTemplateCachePath(name: string): string {
  return join(getCacheDir(), `${name}.json`);
}

/**
 * Get the cache file path for the template list
 */
function getTemplateListCachePath(): string {
  return join(getCacheDir(), "templates.json");
}

// ============================================================================
// Cache Operations
// ============================================================================

/**
 * Read a cached template
 */
function readCachedTemplate(name: string): CachedTemplate | null {
  const cachePath = getTemplateCachePath(name);

  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    const content = readFileSync(cachePath, "utf-8");
    return JSON.parse(content) as CachedTemplate;
  } catch {
    return null;
  }
}

/**
 * Write a template to cache
 */
function writeCachedTemplate(
  name: string,
  source: string,
  etag?: string
): void {
  ensureCacheDir();
  const cachePath = getTemplateCachePath(name);

  const cached: CachedTemplate = {
    name,
    source,
    etag,
    cachedAt: Date.now(),
  };

  writeFileSync(cachePath, JSON.stringify(cached, null, 2));
}

/**
 * Read the cached template list
 */
function readCachedTemplateList(): CachedTemplateList | null {
  const cachePath = getTemplateListCachePath();

  if (!existsSync(cachePath)) {
    return null;
  }

  try {
    const content = readFileSync(cachePath, "utf-8");
    return JSON.parse(content) as CachedTemplateList;
  } catch {
    return null;
  }
}

/**
 * Write the template list to cache
 */
function writeCachedTemplateList(templates: string[], etag?: string): void {
  ensureCacheDir();
  const cachePath = getTemplateListCachePath();

  const cached: CachedTemplateList = {
    templates,
    etag,
    cachedAt: Date.now(),
  };

  writeFileSync(cachePath, JSON.stringify(cached, null, 2));
}

/**
 * Check if a cache entry is stale
 */
function isCacheStale(cachedAt: number): boolean {
  return Date.now() - cachedAt > CACHE_TTL_MS;
}

// ============================================================================
// API Operations
// ============================================================================

/**
 * Fetch a gitignore template from GitHub API
 *
 * Priority:
 * 1. Return cached template if not stale
 * 2. Fetch from GitHub API with ETag validation
 * 3. Fallback to bundled template on network error
 */
export async function fetchGitignoreTemplate(
  name: string
): Promise<FetchResult> {
  // Check cache first
  const cached = readCachedTemplate(name);

  if (cached && !isCacheStale(cached.cachedAt)) {
    return {
      source: cached.source,
      fromCache: true,
      fallback: false,
    };
  }

  // Try to fetch from GitHub API
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "agent-foreman",
    };

    // Add ETag for conditional request if we have a cached version
    if (cached?.etag) {
      headers["If-None-Match"] = cached.etag;
    }

    const response = await fetch(`${GITHUB_API_BASE}/${name}`, { headers });

    // 304 Not Modified - cache is still valid
    if (response.status === 304 && cached) {
      // Update cache timestamp
      writeCachedTemplate(cached.name, cached.source, cached.etag);
      return {
        source: cached.source,
        fromCache: true,
        fallback: false,
      };
    }

    // 404 Not Found - template doesn't exist
    if (response.status === 404) {
      // Try bundled template as fallback
      const bundled = getBundledTemplate(name);
      if (bundled) {
        return {
          source: bundled,
          fromCache: false,
          fallback: true,
        };
      }
      throw new Error(`Template '${name}' not found`);
    }

    // Other errors
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // Parse response
    const data = (await response.json()) as GitignoreApiResponse;
    const etag = response.headers.get("etag") || undefined;

    // Cache the result
    writeCachedTemplate(name, data.source, etag);

    return {
      source: data.source,
      fromCache: false,
      fallback: false,
    };
  } catch (error) {
    // Network error or API error - try fallback options

    // 1. Return stale cache if available
    if (cached) {
      return {
        source: cached.source,
        fromCache: true,
        fallback: false,
      };
    }

    // 2. Try bundled template
    if (isBundledTemplate(name)) {
      const bundled = getBundledTemplate(name);
      if (bundled) {
        return {
          source: bundled,
          fromCache: false,
          fallback: true,
        };
      }
    }

    // 3. No fallback available
    throw error;
  }
}

/**
 * List all available gitignore templates from GitHub API
 *
 * Priority:
 * 1. Return cached list if not stale
 * 2. Fetch from GitHub API with ETag validation
 * 3. Return empty array on error (graceful degradation)
 */
export async function listGitignoreTemplates(): Promise<string[]> {
  // Check cache first
  const cached = readCachedTemplateList();

  if (cached && !isCacheStale(cached.cachedAt)) {
    return cached.templates;
  }

  // Try to fetch from GitHub API
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "agent-foreman",
    };

    // Add ETag for conditional request if we have a cached version
    if (cached?.etag) {
      headers["If-None-Match"] = cached.etag;
    }

    const response = await fetch(GITHUB_API_BASE, { headers });

    // 304 Not Modified - cache is still valid
    if (response.status === 304 && cached) {
      // Update cache timestamp
      writeCachedTemplateList(cached.templates, cached.etag);
      return cached.templates;
    }

    // Other errors
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    // Parse response (array of template names)
    const templates = (await response.json()) as string[];
    const etag = response.headers.get("etag") || undefined;

    // Cache the result
    writeCachedTemplateList(templates, etag);

    return templates;
  } catch {
    // Return stale cache if available, otherwise empty array
    if (cached) {
      return cached.templates;
    }
    return [];
  }
}

/**
 * Clear the gitignore cache
 */
export function clearCache(): void {
  const cacheDir = getCacheDir();
  if (existsSync(cacheDir)) {
    // Remove all .json files in the cache directory
    const fs = require("node:fs");
    const files = fs.readdirSync(cacheDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        fs.unlinkSync(join(cacheDir, file));
      }
    }
  }
}

/**
 * Get the cache TTL in milliseconds
 */
export function getCacheTTL(): number {
  return CACHE_TTL_MS;
}
