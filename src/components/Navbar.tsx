
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-3 glass shadow-glass' 
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <a 
              href="/"
              className="text-xl font-medium flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <span className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">A</span>
              </span>
              <span className="font-semibold">ClearAir</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-10">
            <a href="/" className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity">
              Dashboard
            </a>
            <a href="#forecast" className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity">
              Forecast
            </a>
            <a href="#map" className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity">
              Map
            </a>
            <a href="#tips" className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity">
              Health Tips
            </a>
          </nav>

          {/* Call to Action */}
          <div className="hidden md:block">
            <Button size="sm" variant="outline" className="rounded-full px-6">
              About
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 transition-opacity hover:opacity-80"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass mt-1 py-6 px-4 animate-scale-in">
          <nav className="flex flex-col gap-4">
            <a 
              href="/" 
              className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Dashboard
            </a>
            <a 
              href="#forecast" 
              className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Forecast
            </a>
            <a 
              href="#map" 
              className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Map
            </a>
            <a 
              href="#tips" 
              className="font-medium text-sm opacity-80 hover:opacity-100 transition-opacity py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Health Tips
            </a>
            <Button size="sm" variant="outline" className="mt-2 w-full rounded-full">
              About
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
