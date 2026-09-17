
import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Planos', href: '#planos' },
    { name: 'Parceiros', href: '#parceiros' },
    { name: 'Ranking', href: '#ranking' },
    { name: 'Doe Agora', href: '#doacao' },
    { name: 'Seja um Parceiro', href: '#trabalhe-conosco' },
  ];

  const whatsappLink = "https://wa.me/+5592992411099?text=Ol%C3%A1%2C%20Seja%20Bem%20Vindo%20ao%20HubCare.%20Somos%20um%20hub%20de%20cuidado%20que%20conecta%20fam%C3%ADlias%20a%20profissionais%20qualificados%2C%20oferecendo%20seguran%C3%A7a%2C%20confian%C3%A7a%20e%20cuidado%20sob%20demanda.";

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl leading-none">H</span>
          </div>
          <span className={`text-2xl font-bold tracking-tight ${isScrolled ? 'text-blue-900' : 'text-blue-900'}`}>
            HUB<span className="text-emerald-500">CARE</span>
          </span>
        </div>

        <nav className="hidden xl:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base"
            >
              {link.name}
            </a>
          ))}
          
          <a 
            href={whatsappLink} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-full font-semibold flex items-center gap-2 transition-all transform hover:scale-105 shadow-md"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
        </nav>

        <button 
          className="xl:hidden text-blue-900"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-slate-100 flex flex-col p-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-slate-700 font-medium py-2 px-4 hover:bg-slate-50 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <a 
            href={whatsappLink} 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageCircle size={20} />
            WhatsApp
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
