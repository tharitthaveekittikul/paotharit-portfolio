import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmailLink } from "@/components/shared/EmailLink";
import { ZoomableImage } from "@/components/mdx/ZoomableImage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <section className="mb-20">
        <div className="flex items-start gap-6">
          <div className="w-[150px] h-[150px] shrink-0 overflow-hidden rounded-lg">
            <ZoomableImage
              src="/about/profile.png"
              alt="Tharit Thaveekittikul"
            />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Tharit Thaveekittikul
              </h1>
              <Badge variant="secondary">{t("openToWork")}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Software Engineer</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("location")}
            </p>
            <p className="mt-3 max-w-xl text-muted-foreground">{t("bio")}</p>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("systems.title")}
        </h2>
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border">
            <ZoomableImage
              src="/about/obsidian-graph.png"
              alt="Obsidian knowledge graph"
            />
            <div className="p-5">
              <h3 className="mb-2 font-semibold text-foreground">
                {t("systems.obsidian.title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("systems.obsidian.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("languages.title")}
        </h2>
        <div className="space-y-3">
          {(["thai", "english", "japanese", "mandarin"] as const).map(
            (lang) => (
              <div key={lang} className="flex gap-6">
                <span className="w-24 shrink-0 text-sm font-medium text-foreground">
                  {t(`languages.${lang}.name`)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t(`languages.${lang}.level`)}
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="mb-20">
        <h2 className="mb-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("outside.title")}
        </h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("outside.travel")}</p>
          <p className="text-sm text-muted-foreground">
            {t.rich("outside.finance", {
              zentri: (chunks) => (
                <Link
                  href={`/${locale}/projects/zentri`}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {chunks}
                </Link>
              ),
              llmsystemtrading: (chunks) => (
                <Link
                  href={`/${locale}/projects/llmsystemtrading`}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t("outside.learning")}
          </p>
          <p className="text-sm text-muted-foreground">{t("outside.games")}</p>
        </div>
      </section>

      <section>
        <p className="mb-6 max-w-xl text-muted-foreground">{t("closing")}</p>
        <div className="flex items-center gap-4">
          <EmailLink variant="inline" />
          <a
            href="https://www.linkedin.com/in/paotharit/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("linkedin")}
          </a>
        </div>
      </section>
    </div>
  );
}
