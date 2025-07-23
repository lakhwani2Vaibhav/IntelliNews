import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Blog - IntelliNews',
  description: 'Explore articles, insights, and updates from the IntelliNews team. Stay informed about the future of news, AI, and technology.',
};

const blogPosts = [
  {
    id: 1,
    title: 'The Rise of Generative AI in News Reporting',
    description: 'How artificial intelligence is shaping content creation and what it means for the future of media consumption. A deep dive into the technology behind IntelliNews.',
    date: 'November 5, 2023',
    slug: '#',
  },
  {
    id: 2,
    title: '5 Tips for Combating Information Overload in the Digital Age',
    description: 'Feeling overwhelmed by constant updates? Learn practical strategies to stay informed without the burnout, using personalized news feeds like ours.',
    date: 'November 2, 2023',
    slug: '#',
  },
  {
    id: 3,
    title: 'Personalization vs. Privacy: The Ethics of AI-Curated News',
    description: 'We explore the delicate balance between creating a personalized news experience and protecting user data. Learn about our commitment to privacy.',
    date: 'October 28, 2023',
    slug: '#',
  },
  {
    id: 4,
    title: 'How Vertical Video is Changing News: Introducing Shorts View',
    description: 'A look into why we developed our "Shorts View" and how snackable, vertical video content is becoming a primary way people consume news.',
    date: 'October 25, 2023',
    slug: '#',
  },
  {
    id: 5,
    title: 'Beyond the Headlines: Using AI to Discover Niche Topics',
    description: 'Discover how IntelliNews helps you break out of the news bubble by suggesting relevant topics you might not have found otherwise.',
    date: 'October 21, 2023',
    slug: '#',
  },
  {
    id: 6,
    title: 'The Importance of Media Literacy in an AI-Driven World',
    description: 'As news becomes more automated, the ability to critically evaluate sources is more important than ever. We share resources and thoughts on the topic.',
    date: 'October 17, 2023',
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
            Insights, ideas, and updates from our team on the future of news.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
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
      </main>
      <Footer />
    </div>
  );
}
