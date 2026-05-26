import Link from "next/link";
import { Button } from "@base-ui/react/button";
import FeaturedCard from "@/components/Common/featuredCard";
import CommonGrid from "@/components/Common/commonGrid";
import Footer from "@/components/Common/footer";
import { TypingAnimation } from "@/components/ui/typing-animation";
import type { BadgeData } from "@/components/Common/featuredCard";
import type { GridItem } from "@/components/Common/commonGrid";

type ApiPost = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
};

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getData() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
  const [posts, badges] = await Promise.all([
    fetch(`${base}/api/posts`, { cache: "no-store" }).then<ApiPost[]>((r) => r.ok ? r.json() : []),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then<ApiBadge[]>((r) => r.ok ? r.json() : []),
  ]);
  return { posts, badges };
}

function resolveBadges(post: ApiPost, badgeMap: Record<string, ApiBadge>): BadgeData[] {
  return [post.badge1Id, post.badge2Id, post.badge3Id]
    .filter(Boolean)
    .map((id) => badgeMap[id!])
    .filter(Boolean)
    .map((b) => ({ name: b.name, bgColor: b.bgColor, textColor: b.textColor }));
}

function toGridItem(post: ApiPost, badgeMap: Record<string, ApiBadge>): GridItem {
  return {
    id: post.id,
    image: post.imageUrl ? { src: post.imageUrl, alt: post.name } : null,
    title: post.name,
    description: post.summary,
    badges: resolveBadges(post, badgeMap),
    actions: [{ label: "Ler Artigo", href: `/blog/${post.slug}` }],
  };
}

export default async function Blog() {
  const { posts, badges } = await getData();
  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));

  const [featured, ...rest] = posts;
  const gridItems = rest.map((p) => toGridItem(p, badgeMap));

  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          BLOG_
        </TypingAnimation>
      </div>
      <h3 className="text-left w-full">{"> "}Artigos sobre desenvolvimento e tecnologia</h3>

      {featured && (
        <section className="w-full">
          <TypingAnimation
            duration={200}
            className="font-heading font-semibold text-primary text-2xl text-left"
            aria-hidden="true"
          >
            POST EM DESTAQUE_
          </TypingAnimation>
          <div className="mt-6 py-6">
            <FeaturedCard
              image={featured.imageUrl ? { src: featured.imageUrl, alt: featured.name } : null}
              title={featured.name}
              description={featured.summary}
              badges={resolveBadges(featured, badgeMap)}
            >
              <Link href={`/blog/${featured.slug}`}>
                <Button className="bg-background text-foreground py-3 px-4 rounded-xl">
                  Ler Artigo
                </Button>
              </Link>
            </FeaturedCard>
          </div>
        </section>
      )}

      {gridItems.length > 0 && <CommonGrid items={gridItems} />}

      {posts.length === 0 && (
        <p className="text-muted-foreground text-sm py-16">Nenhum artigo publicado ainda.</p>
      )}

      <Footer />
    </main>
  );
}
