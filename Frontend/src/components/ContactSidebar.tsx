import { useEffect, type ReactNode } from "react";
import { X, Phone, Mail, MapPin, Clock, Github, FileText } from "lucide-react";

type ContactSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function ContactSidebar({ isOpen, onClose }: ContactSidebarProps) {
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/25 backdrop-blur-[2px]"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-[100] flex w-full max-w-[min(100vw,420px)] flex-col border-l border-black/10 bg-white text-foreground shadow-[-12px_0_40px_rgba(0,0,0,0.08)] transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        aria-label="Contact information"
      >
        <div className="flex h-full min-h-0 flex-col overflow-hidden p-6 sm:p-8">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/10 pb-6">
            <div>
              <h3 className="font-display text-[1.5rem] font-semibold leading-tight text-foreground sm:text-[1.75rem]">
                Contact Information
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-foreground/65 sm:text-[14px]">
                If you have any questions, feel free to get in touch with us.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-foreground transition-colors hover:bg-black hover:text-white"
              aria-label="Close contact panel"
            >
              <X className="h-4 w-4" strokeWidth={2.5} />
            </button>
          </div>

          <div className="scrollbar-none flex min-h-0 flex-1 flex-col justify-center gap-5 py-6 sm:gap-6 sm:py-8">
            <ContactRow
              icon={<Phone className="h-4 w-4" strokeWidth={2} />}
              label="PHONE"
              href="tel:+919892885090"
            >
              +91 9892885090
            </ContactRow>

            <ContactRow
              icon={<Mail className="h-4 w-4" strokeWidth={2} />}
              label="EMAIL"
              href="mailto:kunaldp379@gmail.com"
            >
              kunaldp379@gmail.com
            </ContactRow>

            <ContactRow icon={<MapPin className="h-4 w-4" strokeWidth={2} />} label="LOCATION">
              Mumbai, Maharashtra, India
            </ContactRow>

            <ContactRow icon={<Clock className="h-4 w-4" strokeWidth={2} />} label="AVAILABILITY">
              <>
                Monday - Sunday
                <span className="mt-0.5 block text-[13px] font-normal text-foreground/65">
                  10:00 AM - 10:00 PM
                </span>
              </>
            </ContactRow>

            <ContactRow
              icon={<Github className="h-4 w-4" strokeWidth={2} />}
              label="GITHUB"
              href="https://github.com/kunalpro379"
              external
            >
              github.com/kunalpro379
            </ContactRow>

            <ContactRow
              icon={<FileText className="h-4 w-4" strokeWidth={2} />}
              label="RESUME"
              href="https://notesportfolio.blob.core.windows.net/notes/Resume.kunal.pdf"
              external
            >
              View Resume →
            </ContactRow>
          </div>

          <div className="shrink-0 border-t border-black/10 pt-6">
            <p className="text-[13px] leading-[1.65] text-foreground/80 sm:text-[14px]">
              <span className="font-semibold text-foreground">Open for full-time roles</span> in AI/ML,
              DevOps, and Backend Development. Also available for{" "}
              <span className="font-semibold text-foreground">freelance projects</span> and{" "}
              <span className="font-semibold text-foreground">remote work opportunities</span>.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

function ContactRow({
  icon,
  label,
  children,
  href,
  external,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  href?: string;
  external?: boolean;
}) {
  const content = href ? (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="text-[14px] font-medium text-foreground transition-colors hover:text-foreground/70 break-all"
    >
      {children}
    </a>
  ) : (
    <p className="text-[14px] font-medium text-foreground">{children}</p>
  );

  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white text-foreground">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="label-mono mb-1 text-[10px] tracking-[0.18em] text-foreground/50">{label}</div>
        {content}
      </div>
    </div>
  );
}
