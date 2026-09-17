
import React from 'react';
import { Instagram, Linkedin, Facebook, Youtube, Send } from 'lucide-react';

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: <Instagram size={20} />, href: "#", name: "Instagram" },
    { icon: <Linkedin size={20} />, href: "#", name: "LinkedIn" },
    { icon: <Facebook size={20} />, href: "#", name: "Facebook" },
    { icon: <Youtube size={20} />, href: "#", name: "YouTube" },
  ];

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl leading-none">H</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-blue-900">
                HUB<span className="text-emerald-500">CARE</span>
              </span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              Conectando famílias a parceiros cuidadores com segurança, agilidade e humanidade. O cuidado que você precisa, onde você estiver.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-blue-900 font-bold mb-6">Navegação</h4>
            <nav className="flex flex-col gap-4 text-slate-500 text-sm">
              <a href="#home" className="hover:text-blue-600 transition-colors">Início</a>
              <a href="#planos" className="hover:text-blue-600 transition-colors">Planos Assinatura</a>
              <a href="#parceiros" className="hover:text-blue-600 transition-colors">Nossos Parceiros</a>
              <a href="#ranking" className="hover:text-blue-600 transition-colors">Ranking Cuidadores</a>
              <a href="#doacao" className="hover:text-blue-600 transition-colors">HUBCARE Social</a>
            </nav>
          </div>

          <div>
            <h4 className="text-blue-900 font-bold mb-6">Suporte</h4>
            <nav className="flex flex-col gap-4 text-slate-500 text-sm">
              <a href="#trabalhe-conosco" className="hover:text-blue-600 transition-colors">Seja um Parceiro</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Central de Ajuda</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Segurança</a>
              <a href="#contato" className="hover:text-blue-600 transition-colors">Fale Conosco</a>
            </nav>
          </div>

          <div>
            <h4 className="text-blue-900 font-bold mb-6">Newsletter</h4>
            <p className="text-slate-500 text-sm mb-4">Receba dicas de saúde e bem-estar para sua família.</p>
            <form className="relative">
              <input 
                type="email" 
                placeholder="Seu e-mail" 
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-12"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 p-1 hover:text-blue-700">
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} HUBCARE. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600">Privacidade</a>
            <a href="#" className="hover:text-slate-600">Termos de Uso</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
