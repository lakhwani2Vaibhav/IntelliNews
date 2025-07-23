import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog - IntelliNews',
  description: 'Explore articles, insights, and updates from the IntelliNews team. Stay informed about the future of news and technology.',
};

const placeholderPosts = [
  {
    id: 1,
    title: 'The Future of AI in Journalism',
    description: 'How artificial intelligence is shaping the way we consume news and what it means for the future of media.',
    date: 'October 26, 2023',
    slug: '#',
  },
  {
    id: 2,
    title: '5 Tips for Avoiding Information Overload',
    description: 'In a world of constant updates, here are some practical tips to stay informed without feeling overwhelmed.',
    date: 'October 22, 2023',
    slug: '#',
  },
  {
    id: 3,
    title: 'Introducing Shorts View: A New Way to Watch the News',
    description: 'We are excited to launch a new, immersive way to experience news content on the go. Learn more about it here.',
    date: 'October 18, 2023',
    slug: '#',
  },
];


export default function BlogPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">IntelliNews Blog</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Insights, ideas, and updates from our team.
          </p>
        </div>
        
        <div className="text-center p-8 border rounded-lg bg-card text-card-foreground">
            <h2 className="text-2xl font-semibold">Coming Soon!</h2>
            <p className="mt-2 text-muted-foreground">Our full blog is under construction. Stay tuned for exciting content!</p>
        </div>

        <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Latest Posts (Examples)</h3>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {placeholderPosts.map((post) => (
                <Card key={post.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription>{post.date}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p>{post.description}</p>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="outline" disabled>
                    <Link href={post.slug}>
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
