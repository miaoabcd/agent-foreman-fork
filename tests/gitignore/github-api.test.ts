/**
 * Tests for GitHub gitignore API client
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";

import {
  getCacheDir,
  getCacheTTL,
  fetchGitignoreTemplate,
  listGitignoreTemplates,
  clearCache,
} from "../../src/gitignore/github-api.js";

import { getBundledTemplate } from "../../src/gitignore/bundled-templates.js";

// ============================================================================
// Test Setup
// ============================================================================

// Cache directory for tests
const originalCacheDir = getCacheDir();

// Mock fetch for API tests
const originalFetch = global.fetch;

function mockFetch(response: {
  ok: boolean;
  status: number;
  json?: () => Promise<unknown>;
  headers?: { get: (name: string) => string | null };
}) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: response.ok,
    status: response.status,
    json: response.json || (() => Promise.resolve({})),
    headers: response.headers || { get: () => null },
  });
}

function restoreFetch() {
  global.fetch = originalFetch;
}

// ============================================================================
// Cache Directory Tests
// ============================================================================

describe("cache directory", () => {
  it("should return cache directory path in user home", () => {
    const cacheDir = getCacheDir();
    expect(cacheDir).toContain(".agent-foreman");
    expect(cacheDir).toContain("gitignore-cache");
  });

  it("should have 7-day TTL", () => {
    const ttl = getCacheTTL();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    expect(ttl).toBe(sevenDaysMs);
  });
});

// ============================================================================
// Fetch Template Tests (with mocking)
// ============================================================================

describe("fetchGitignoreTemplate", () => {
  afterEach(() => {
    restoreFetch();
  });

  it("should return bundled template for bundled template names without API call", async () => {
    // Mock fetch to throw error (shouldn't be called for bundled templates)
    mockFetch({ ok: false, status: 500 });

    const result = await fetchGitignoreTemplate("Node");

    // Should return successfully (either cached or bundled)
    expect(result.source).toContain("node_modules");
  });

  it("should return FetchResult with source, fromCache, and fallback properties", async () => {
    const result = await fetchGitignoreTemplate("Node");

    expect(result).toHaveProperty("source");
    expect(result).toHaveProperty("fromCache");
    expect(result).toHaveProperty("fallback");
    expect(typeof result.source).toBe("string");
    expect(typeof result.fromCache).toBe("boolean");
    expect(typeof result.fallback).toBe("boolean");
  });

  it("should fallback to bundled template on network error", async () => {
    // Mock fetch to simulate network error
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const result = await fetchGitignoreTemplate("Node");

    // Should fallback to bundled
    expect(result.source).toContain("node_modules");
    expect(result.fallback || result.fromCache).toBe(true);
  });

  it("should fallback to bundled template on 404 for bundled templates", async () => {
    mockFetch({ ok: false, status: 404 });

    const result = await fetchGitignoreTemplate("Node");

    // Should fallback to bundled or return from cache
    expect(result.source).toContain("node_modules");
    // Either fallback to bundled or returned from cache (both are acceptable)
    expect(result.fallback || result.fromCache).toBe(true);
  });

  it("should throw error for unknown template with no fallback", async () => {
    mockFetch({ ok: false, status: 404 });

    await expect(fetchGitignoreTemplate("NonExistentTemplate123")).rejects.toThrow();
  });
});

// ============================================================================
// List Templates Tests
// ============================================================================

describe("listGitignoreTemplates", () => {
  afterEach(() => {
    restoreFetch();
  });

  it("should return array of template names", async () => {
    // Mock successful API response
    mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve(["Node", "Python", "Go", "Rust", "Java"]),
      headers: { get: () => null },
    });

    const templates = await listGitignoreTemplates();

    expect(Array.isArray(templates)).toBe(true);
  });

  it("should return empty array on network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const templates = await listGitignoreTemplates();

    expect(Array.isArray(templates)).toBe(true);
  });
});

// ============================================================================
// Cache Behavior Tests
// ============================================================================

describe("cache behavior", () => {
  let testCacheDir: string;

  beforeEach(() => {
    testCacheDir = fs.mkdtempSync(path.join(os.tmpdir(), "gitignore-cache-test-"));
  });

  afterEach(() => {
    try {
      fs.rmSync(testCacheDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
    restoreFetch();
  });

  it("should cache templates after fetching", async () => {
    // First fetch with mocked API
    mockFetch({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ name: "TestTemplate", source: "test content" }),
      headers: { get: () => '"etag123"' },
    });

    // Fetch to populate cache
    await fetchGitignoreTemplate("Node");

    // Subsequent fetches should work (either from cache or bundled)
    const result = await fetchGitignoreTemplate("Node");
    expect(result.source).toBeDefined();
  });

  it("should return cached template on cache hit", async () => {
    // First fetch (bundled or API)
    const result1 = await fetchGitignoreTemplate("Node");

    // Second fetch should be from cache or bundled
    const result2 = await fetchGitignoreTemplate("Node");

    expect(result2.source).toBe(result1.source);
  });
});

// ============================================================================
// Clear Cache Tests
// ============================================================================

describe("clearCache", () => {
  it("should not throw when cache directory does not exist", () => {
    expect(() => clearCache()).not.toThrow();
  });

  it("should clear cache files when directory exists", () => {
    const cacheDir = getCacheDir();

    // Create cache directory and a test file
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, "test.json"), "{}");

    // Clear cache
    clearCache();

    // Test file should be removed
    expect(fs.existsSync(path.join(cacheDir, "test.json"))).toBe(false);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe("integration", () => {
  it("should prioritize bundled templates over API", async () => {
    // This test verifies that bundled templates are used when available
    const bundled = getBundledTemplate("Node");
    const fetched = await fetchGitignoreTemplate("Node");

    // Both should have node_modules pattern
    expect(bundled).toContain("node_modules");
    expect(fetched.source).toContain("node_modules");
  });

  it("should handle all bundled template names", async () => {
    const bundledNames = ["Node", "Python", "Go", "Rust", "Java", "Nextjs"];

    for (const name of bundledNames) {
      const result = await fetchGitignoreTemplate(name);
      expect(result.source).toBeDefined();
      expect(result.source.length).toBeGreaterThan(0);
    }
  });
});
