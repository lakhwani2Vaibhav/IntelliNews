import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Footer from '@/components/Footer';
import { blogPosts } from '@/lib/blog-posts';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title} - IntelliNews Blog`,
    description: post.description,
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <article className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{post.title}</CardTitle>
              <CardDescription className="mt-2 text-lg">{post.date}</CardDescription>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                {post.content.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </CardContent>
          </Card>
        </article>
      </main>
      <Footer />
    </div>
  );
}
