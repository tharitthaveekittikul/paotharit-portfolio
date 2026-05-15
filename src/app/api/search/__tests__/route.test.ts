import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/content", () => ({
  getAllContent: vi.fn(),
}));

vi.mock("@/lib/docs", () => ({
  buildSidebarTree: vi.fn(),
  getDocBySlug: vi.fn(),
  extractHeadings: vi.fn(),
}));

vi.mock("fs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("fs")>();
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
  };
});

import { GET } from "../route";
import { getAllContent } from "@/lib/content";
import { buildSidebarTree, getDocBySlug, extractHeadings } from "@/lib/docs";
import { existsSync, readdirSync } from "fs";

const mockGetAllContent = vi.mocked(getAllContent);
const mockBuildSidebarTree = vi.mocked(buildSidebarTree);
const mockGetDocBySlug = vi.mocked(getDocBySlug);
const mockExtractHeadings = vi.mocked(extractHeadings);
const mockExistsSync = vi.mocked(existsSync);
const mockReaddirSync = vi.mocked(readdirSync);

describe("GET /api/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExistsSync.mockReturnValue(false);
    mockReaddirSync.mockReturnValue([]);
    mockBuildSidebarTree.mockReturnValue([]);
    mockGetAllContent.mockReturnValue([]);
  });

  it("returns blog entries", async () => {
    mockGetAllContent.mockImplementation((type) => {
      if (type === "blog")
        return [
          {
            slug: "hello",
            title: "Hello World",
            description: "A blog post",
            tags: ["react"],
            type: "blog" as const,
            status: "published" as const,
            featured: false,
            date: "2024-01-01",
            techStack: [],
          },
        ];
      return [];
    });
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "blog",
        title: "Hello World",
        href: "/en/blog/hello",
      }),
    );
  });

  it("returns project entries with techStack as tags", async () => {
    mockGetAllContent.mockImplementation((type) => {
      if (type === "projects")
        return [
          {
            slug: "zentri",
            title: "Zentri",
            description: "Finance app",
            tags: [],
            techStack: ["Next.js", "TypeScript"],
            type: "project" as const,
            status: "published" as const,
            featured: true,
            date: "2024-01-01",
          },
        ];
      return [];
    });
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "project",
        title: "Zentri",
        href: "/en/projects/zentri",
        tags: ["Next.js", "TypeScript"],
      }),
    );
  });

  it("returns doc and section entries from docs directory", async () => {
    mockExistsSync.mockReturnValue(true);
    mockReaddirSync.mockReturnValue(["zentri"] as any);
    mockBuildSidebarTree.mockReturnValue([
      {
        type: "item",
        label: "Overview",
        href: "/en/docs/zentri/overview",
        slug: ["overview"],
      },
    ]);
    mockGetDocBySlug.mockReturnValue({
      frontmatter: { title: "Overview", description: "Intro", type: "doc" },
      content: "## Introduction",
    });
    mockExtractHeadings.mockReturnValue([
      { text: "Introduction", id: "introduction", level: 2 },
    ]);
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "doc",
        title: "Overview",
        href: "/en/docs/zentri/overview",
      }),
    );
    expect(data).toContainEqual(
      expect.objectContaining({
        type: "section",
        title: "Introduction",
        href: "/en/docs/zentri/overview#introduction",
        breadcrumb: "Zentri > Overview",
      }),
    );
  });

  it("skips docs when directory does not exist", async () => {
    mockExistsSync.mockReturnValue(false);
    const req = new NextRequest("http://localhost/api/search?locale=en");
    const res = await GET(req);
    const data = await res.json();
    expect(data.filter((e: any) => e.type === "doc")).toHaveLength(0);
  });
});
