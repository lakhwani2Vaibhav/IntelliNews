import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy - IntelliNews',
  description: 'Read the official Privacy Policy for IntelliNews. Understand how we handle your data and respect your privacy.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">1. Introduction</h2>
              <p className="text-muted-foreground">
                Welcome to IntelliNews. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">2. Information We Collect</h2>
              <p className="text-muted-foreground">
                We may collect information about you in a variety of ways. The information we may collect via the Application includes your reading history to personalize your news feed and suggest relevant topics. All data is handled anonymously where possible.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">3. Use of Your Information</h2>
              <p className="text-muted-foreground">
                Having accurate information permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to create a personalized feed of news and AI-generated content based on your interests.
              </p>
            </div>
             <div className="space-y-2">
              <h2 className="text-xl font-semibold">4. Security of Your Information</h2>
              <p className="text-muted-foreground">
                We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">5. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions or comments about this Privacy Policy, please contact us through the contact form on our website.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
