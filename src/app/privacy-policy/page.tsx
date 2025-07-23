import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - IntelliNews',
  description: 'Read the official Privacy Policy for intellinews.co.in. Understand how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
             <p className="text-sm text-center text-muted-foreground">Last updated: July 23, 2024</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to IntelliNews ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website <a href="https://www.intellinews.co.in/" className="text-primary hover:underline">intellinews.co.in</a> and use our services.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">2. Information We Collect</h2>
              <p className="text-muted-foreground">
                To provide a personalized experience, we collect your reading history (such as topics you click on). This data is used to power our AI-driven features, like topic suggestions and personalized news generation. We may also collect technical data such as your browser type and IP address for analytics and security purposes. All data is handled with a focus on anonymity wherever possible.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">3. Use of Your Information</h2>
              <p className="text-muted-foreground">
                Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
              </p>
               <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Create a personalized feed of news and AI-generated content based on your interests.</li>
                  <li>Suggest new topics and trending stories relevant to you.</li>
                  <li>Monitor and analyze usage and trends to improve your experience.</li>
                  <li>Ensure the security of our platform.</li>
                </ul>
            </div>
             <div className="space-y-2">
              <h2 className="text-xl font-semibold">4. Security of Your Information</h2>
              <p className="text-muted-foreground">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">5. Third-Party Services</h2>
               <p className="text-muted-foreground">
                Our application integrates with third-party APIs to fetch news content. We are not responsible for the content or privacy practices of these services. We encourage you to review their privacy policies.
              </p>
            </div>
             <div className="space-y-2">
              <h2 className="text-xl font-semibold">6. Changes to This Privacy Policy</h2>
               <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions or comments about this Privacy Policy, please contact us through the <Link href="/contact" className="text-primary hover:underline">contact form</Link> on our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
