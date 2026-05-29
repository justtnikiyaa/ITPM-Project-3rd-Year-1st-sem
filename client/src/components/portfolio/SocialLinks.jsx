import { Linkedin, Github, Globe, ExternalLink } from 'lucide-react';

function SocialLinks({ linkedin, github, website }) {
    if (!linkedin && !github && !website) return null;

    const links = [
        { url: linkedin, icon: <Linkedin size={20} />, label: 'LinkedIn', color: '#0077b5' },
        { url: github, icon: <Github size={20} />, label: 'GitHub', color: '#333' },
        { url: website, icon: <Globe size={20} />, label: 'Portfolio', color: '#4a3fb9' },
    ].filter(link => link.url);

    return (
        <div className="flex gap-4 items-center mt-4">
            {links.map((link, idx) => (
                <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex items-center justify-center p-2 rounded-full bg-white border border-[#ececff] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                    title={link.label}
                    style={{ color: link.color }}
                >
                    {link.icon}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform duration-200 bg-[#2c2c44] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap shadow-xl">
                        {link.label} <ExternalLink size={8} className="inline ml-1" />
                    </span>
                </a>
            ))}
        </div>
    );
}

export default SocialLinks;
