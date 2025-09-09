'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

type NavItem = {
    name: string;
    href: string;
};



export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-colors duration-200">
            <div className="flex h-16 items-center justify-between pl-9 pr-3">
                <div className="flex items-center space-x-4">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                            Skate Deck
                        </span>
                    </Link>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Mobile menu button would go here */}
                    <ThemeToggle />
                </div>
            </div>

            {/* Mobile Navigation (example, would need state to toggle) */}
            {/* <div className="md:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-base font-medium text-foreground/70 hover:bg-accent hover:text-foreground rounded-md"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div> */}
        </header>
    );
}
