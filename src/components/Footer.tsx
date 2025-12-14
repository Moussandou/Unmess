import { Mail, Phone, MapPin, Github, Linkedin, Globe, ExternalLink } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="relative border-t border-white/5 bg-black/40 backdrop-blur-xl mt-20">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
                            Contact
                        </h3>
                        <div className="space-y-4 text-gray-400">
                            <a href="mailto:moussandou.m@gmail.com" className="flex items-center gap-3 hover:text-white transition-colors group">
                                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <span>moussandou.m@gmail.com</span>
                            </a>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-lg bg-white/5">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <span>07 81 63 32 78</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <span>Marseille, France</span>
                            </div>
                        </div>
                    </div>

                    {/* Social / Links */}
                    <div className="flex flex-col md:items-end gap-4">
                        <div className="flex flex-wrap gap-4">
                            <SocialLink href="https://github.com/Moussandou" icon={<Github className="w-5 h-5" />} label="GitHub" />
                            <SocialLink href="https://www.linkedin.com/in/moussandou" icon={<Linkedin className="w-5 h-5" />} label="LinkedIn" />
                            <SocialLink href="https://moussandou.github.io/Portfolio/" icon={<Globe className="w-5 h-5" />} label="Portfolio" />
                            <SocialLink href="https://www.malt.fr/profile/moussandoumroivili" icon={<ExternalLink className="w-5 h-5" />} label="Malt" />
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Designed & Built with ❤️ by Moussandou
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all group"
        >
            <span className="text-gray-400 group-hover:text-purple-400 transition-colors">{icon}</span>
            <span className="text-sm font-medium text-gray-300 group-hover:text-white">{label}</span>
        </a>
    )
}
