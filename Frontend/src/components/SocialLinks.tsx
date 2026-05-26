import type { IconType } from "react-icons";
import {
  SiGithub,
  SiInstagram,
  SiMedium,
  SiThreads,
  SiWhatsapp,
  SiX,
} from "react-icons/si";
import { Linkedin, Mail, Phone, FileText } from "lucide-react";

type SocialLink = {
  label: string;
  href: string;
  Icon: IconType | typeof Linkedin;
  brandColor?: string;
  external?: boolean;
};

const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/kunalpro379", Icon: SiGithub, brandColor: "#181717" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kunal-patil-0357a5259/",
    Icon: Linkedin,
    brandColor: "#0A66C2",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/kunal_patil379/",
    Icon: SiInstagram,
    brandColor: "#E4405F",
  },
  { label: "X", href: "https://x.com/KunalPa40651307", Icon: SiX, brandColor: "#000000" },
  {
    label: "Threads",
    href: "https://www.threads.com/@kunal_patil379",
    Icon: SiThreads,
    brandColor: "#000000",
  },
  {
    label: "Medium",
    href: "https://kunaldp379.medium.com/",
    Icon: SiMedium,
    brandColor: "#000000",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/919892885090",
    Icon: SiWhatsapp,
    brandColor: "#25D366",
  },
  { label: "Phone", href: "tel:+919892885090", Icon: Phone, brandColor: "#8B4513" },
  { label: "Email", href: "mailto:kunaldp379@gmail.com", Icon: Mail, brandColor: "#8B4513" },
  {
    label: "Resume",
    href: "https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf",
    Icon: FileText,
    brandColor: "#8B4513",
    external: true,
  },
];

type SocialLinksProps = {
  size?: "md" | "lg";
};

export function SocialLinks({ size = "lg" }: SocialLinksProps) {
  const iconSize = size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const boxSize = size === "lg" ? "h-12 w-12 sm:h-14 sm:w-14" : "h-11 w-11";

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {socialLinks.map(({ label, href, Icon, brandColor, external }) => (
        <a
          key={label}
          href={href}
          target={external || href.startsWith("http") ? "_blank" : undefined}
          rel={external || href.startsWith("http") ? "noopener noreferrer" : undefined}
          aria-label={label}
          className={`group relative flex ${boxSize} items-center justify-center rounded-xl border border-black/10 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]`}
          style={{ ["--brand" as string]: brandColor }}
        >
          <span
            className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ background: `color-mix(in srgb, ${brandColor} 12%, transparent)` }}
          />
          <Icon
            className={`relative ${iconSize} text-foreground transition-colors duration-300 group-hover:text-[var(--brand)]`}
            aria-hidden
          />
        </a>
      ))}
    </div>
  );
}
