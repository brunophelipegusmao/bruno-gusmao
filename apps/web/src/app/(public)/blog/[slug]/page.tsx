import { notFound } from "next/navigation";
import Footer from "@/components/Common/footer";
import { CommonBadge } from "@/components/Common/commonBadge";
import { TypingAnimation } from "@/components/ui/typing-animation";

type ApiPost = {
  id: string;
  name: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  content: string;
  badge1Id: string | null;
  badge2Id: string | null;
  badge3Id: string | null;
  createdAt: string;
};

type ApiBadge = {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
};

async function getData(slug: string) {
  const base = process.env.API_URL ?? "http://localhost:3001";
  const [post, badges] = await Promise.all([
    fetch(`${base}/api/posts/${slug}`, { cache: "no-store" }).then<ApiPost | null>((r) =>
      r.ok ? r.json() : null
    ),
    fetch(`${base}/api/badges`, { cache: "no-store" }).then<ApiBadge[]>((r) =>
      r.ok ? r.json() : []
    ),
  ]);
  return { post, badges };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post } = await getData(slug);
  if (!post) return { title: "Post não encontrado" };
  const ogImage = post.imageUrl ?? "/og-image.png";
  return {
    title: post.name,
    description: post.summary,
    openGraph: {
      title: post.name,
      description: post.summary,
      url: `https://brunogusmao.dev/blog/${slug}`,
      type: "article",
      images: [{ url: ogImage, alt: post.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.name,
      description: post.summary,
      images: [ogImage],
    },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min de leitura`;
}

function renderMarkdown(content: string) {
  const blocks = content.trim().split(/\n\n+/).map((b) => b.trim()).filter(Boolean);

  return blocks.map((block, i) => {
    if (block.startsWith("# ")) {
      return (
        <h1 key={i} className="font-heading font-semibold text-2xl md:text-3xl text-primary mt-8 mb-4">
          {block.slice(2)}
        </h1>
      );
    }
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-heading font-semibold text-xl text-primary mt-8 mb-3">
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("### ")) {
      return (
        <h3 key={i} className="font-heading font-semibold text-lg text-primary mt-6 mb-2">
          {block.slice(4)}
        </h3>
      );
    }
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const code = lines.slice(1, -1).join("\n");
      return (
        <pre key={i} className="bg-secondary border border-border rounded-lg p-4 overflow-x-auto my-4">
          <code className="text-sm font-mono text-foreground">{code}</code>
        </pre>
      );
    }
    if (block.startsWith("- ") || block.startsWith("* ")) {
      const items = block.split("\n").filter((l) => l.startsWith("- ") || l.startsWith("* "));
      return (
        <ul key={i} className="list-disc list-inside text-muted-foreground leading-relaxed mb-4 space-y-1">
          {items.map((item, j) => (
            <li key={j}>{item.replace(/^[-*] /, "")}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="text-muted-foreground leading-relaxed mb-4">
        {block}
      </p>
    );
  });
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, badges } = await getData(slug);

  if (!post) notFound();

  const badgeMap = Object.fromEntries(badges.map((b) => [b.id, b]));
  const postBadges = [post.badge1Id, post.badge2Id, post.badge3Id]
    .filter(Boolean)
    .map((id) => badgeMap[id!])
    .filter(Boolean);

  return (
    <main className="flex flex-col items-center justify-center max-w-[80%] gap-6 m-auto">
      <div className="flex items-start w-full py-2">
        <TypingAnimation
          duration={200}
          className="font-heading font-semibold text-primary text-6xl text-left"
          aria-hidden="true"
        >
          POST_
        </TypingAnimation>
      </div>

      <div className="flex items-center gap-4 w-full text-sm text-muted-foreground">
        <span>{formatDate(post.createdAt)}</span>
        <span>·</span>
        <span>{estimateReadTime(post.content)}</span>
      </div>

      <h1 className="w-full font-heading font-semibold text-2xl md:text-3xl leading-snug">
        {post.name}
      </h1>

      {postBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 w-full">
          {postBadges.map((b) => (
            <CommonBadge key={b.id} name={b.name} bgColor={b.bgColor} textColor={b.textColor} />
          ))}
        </div>
      )}

      {post.imageUrl && (
        <div className="relative w-full rounded-xl overflow-hidden aspect-video">
          <div className="absolute inset-0 z-10 bg-black/20" />
          <img
            src={post.imageUrl}
            alt={post.name}
            className="w-full h-full object-cover brightness-80 dark:brightness-50"
          />
        </div>
      )}

      <article className="w-full prose-none">
        {renderMarkdown(post.content)}
      </article>

      <Footer />
    </main>
  );
}
