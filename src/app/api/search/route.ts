import { type NextRequest, NextResponse } from "next/server";
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { getAllContent } from "@/lib/content";
import {
  buildSidebarTree,
  getDocBySlug,
  extractHeadings,
  type SidebarNode,
  type DocItem,
} from "@/lib/docs";

export type SearchEntry = {
  type: "blog" | "project" | "doc" | "section" | "action";
  title: string;
  description?: string;
  tags?: string[];
  href: string;
  breadcrumb?: string;
};

function flattenItems(
  nodes: SidebarNode[],
  breadcrumbParts: string[],
): Array<{ item: DocItem; breadcrumb: string }> {
  const result: Array<{ item: DocItem; breadcrumb: string }> = [];
  for (const node of nodes) {
    if (node.type === "item") {
      result.push({ item: node, breadcrumb: breadcrumbParts.join(" > ") });
    } else {
      result.push(
        ...flattenItems(node.children, [...breadcrumbParts, node.label]),
      );
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get("locale") ?? "en";
  const entries: SearchEntry[] = [];

  for (const post of getAllContent("blog", locale)) {
    entries.push({
      type: "blog",
      title: post.title,
      description: post.description,
      tags: post.tags,
      href: `/${locale}/blog/${post.slug}`,
    });
  }

  for (const project of getAllContent("projects", locale)) {
    entries.push({
      type: "project",
      title: project.title,
      description: project.description,
      tags: project.techStack,
      href: `/${locale}/projects/${project.slug}`,
    });
  }

  const docsRoot = join(process.cwd(), "content", locale, "docs");
  if (existsSync(docsRoot)) {
    for (const projectName of readdirSync(docsRoot, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)) {
      const projectLabel =
        projectName.charAt(0).toUpperCase() + projectName.slice(1);
      const tree = buildSidebarTree(projectName, locale);
      const flatItems = flattenItems(tree, [projectLabel]);

      for (const { item, breadcrumb } of flatItems) {
        entries.push({
          type: "doc",
          title: item.label,
          href: item.href,
          breadcrumb,
        });

        const doc = getDocBySlug(projectName, item.slug, locale);
        if (doc) {
          for (const heading of extractHeadings(doc.content)) {
            entries.push({
              type: "section",
              title: heading.text,
              href: `${item.href}#${heading.id}`,
              breadcrumb: `${breadcrumb} > ${item.label}`,
            });
          }
        }
      }
    }
  }

  return NextResponse.json(entries);
}
