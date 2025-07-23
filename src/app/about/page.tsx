import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Us - IntelliNews',
  description: 'Learn more about IntelliNews, our mission, and our team. We are dedicated to bringing you curated news with cutting-edge technology at intellinews.co.in.',
};

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">About IntelliNews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-lg">
            <p>
              Welcome to IntelliNews, your premier destination for news consumption, reimagined for the digital age. At IntelliNews, we believe that staying informed should be an intelligent, seamless, and personalized experience. Our platform at <a href="https://www.intellinews.co.in/" className="text-primary hover:underline">intellinews.co.in</a> leverages the power of cutting-edge AI to deliver news that matters most to you, in a format that fits your lifestyle.
            </p>
            <p>
              Our mission is to cut through the noise of the 24/7 news cycle. We curate stories from thousands of sources, providing you with concise, easy-to-digest summaries without sacrificing the essential details. Whether you're catching up on top stories, diving deep into a specific topic, or exploring AI-generated news based on your interests, IntelliNews is your trusted partner.
            </p>
            <p>
              We are a team of passionate technologists, journalists, and designers dedicated to revolutionizing how the world engages with news. Thank you for joining us on this journey.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
