import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { Flame } from "lucide-react";

export function NavHeader() {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md cursor-pointer transition-transform" data-testid="link-home">
            <Flame className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">DevIgnite</span>
          </Link>
          
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-create">
                Create CV
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">
                Pricing
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-dashboard">
                Dashboard
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6">
              <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-how-it-works">
                How it Works
              </a>
              <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-pricing">
                Pricing
              </a>
            </nav>
          )}
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!isLoading && (
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8"
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <Button 
                      variant="outline"
                      size="sm"
                      data-testid="button-nav-login"
                    >
                      Login
                    </Button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <Button 
                      size="sm"
                      data-testid="button-nav-signup"
                    >
                      Sign Up
                    </Button>
                  </SignUpButton>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
