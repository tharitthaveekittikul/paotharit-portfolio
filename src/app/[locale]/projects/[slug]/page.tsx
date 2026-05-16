import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getAllSlugs, getContent } from "@/lib/content";
import { getProjectImages } from "@/lib/project-images";
import { mdxComponents } from "@/components/mdx";
import { Badge } from "@/components/ui/badge";
import { ProjectGithubLink } from "@/components/shared/ProjectGithubLink";

export async function generateStaticParams() {
  const slugs = getAllSlugs("projects");
  return ["en", "th"].flatMap((locale) =>
    slugs.map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  try {
    const { frontmatter } = getContent("projects", locale, slug);
    return {
      title: frontmatter.seoTitle ?? frontmatter.title,
      description: frontmatter.seoDescription ?? frontmatter.description,
    };
  } catch {
    return {};
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const images = getProjectImages(slug);

  let result: ReturnType<typeof getContent>;
  try {
    result = getContent("projects", locale, slug);
  } catch {
    notFound();
  }
  const { frontmatter, content } = result!;

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {frontmatter.title}
        </h1>
        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
          {frontmatter.description}
        </p>
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-500 dark:text-zinc-400">
          <time
            dateTime={new Date(frontmatter.date).toISOString().slice(0, 10)}
          >
            {new Date(frontmatter.date).toLocaleDateString(
              locale === "th" ? "th-TH" : "en-US",
              { year: "numeric" },
            )}
          </time>
          {frontmatter.role && <span>{frontmatter.role}</span>}
          {frontmatter.duration && <span>{frontmatter.duration}</span>}
          {frontmatter.projectStatus && (
            <Badge variant="outline">{frontmatter.projectStatus}</Badge>
          )}
        </div>
        <div className="mb-6 flex flex-wrap gap-1">
          {frontmatter.techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
        {frontmatter.github && (
          <div className="mb-6">
            <ProjectGithubLink href={frontmatter.github} project={slug} />
          </div>
        )}
        {images.length > 0 && (
          <div className="mb-6">
            <Link
              href={`/${locale}/projects/${slug}/screenshots`}
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              {locale === "th" ? "ดูภาพหน้าจอทั้งหมด" : "View all screenshots"}{" "}
              ({images.length})
            </Link>
          </div>
        )}
        {frontmatter.metrics && frontmatter.metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200 p-4 sm:grid-cols-3 dark:border-zinc-800">
            {frontmatter.metrics.map((metric) => (
              <div key={metric.label}>
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {metric.value}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>
      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  );
}
