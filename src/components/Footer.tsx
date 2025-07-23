import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Image src="/Intelli News Logo.gif" alt="IntelliNews Logo" width={32} height={32} />
            <span className="text-lg font-semibold">IntelliNews</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          </nav>
        </div>
        <div className="text-center text-xs text-muted-foreground mt-6 pt-6 border-t">
          © {new Date().getFullYear()} IntelliNews. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
