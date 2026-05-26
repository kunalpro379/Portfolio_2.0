import type { IconType } from "react-icons";
import { DiJava } from "react-icons/di";
import {
  SiDocker,
  SiGooglegemini,
  SiNodedotjs,
  SiOpenai,
  SiPytorch,
  SiSpringboot,
  SiTensorflow,
} from "react-icons/si";

type TechItem = {
  label: string;
  Icon: IconType;
  color: string;
  mutedLabel?: boolean;
};

const TECH_STACK: TechItem[] = [
  { label: "AI/ML", Icon: SiPytorch, color: "#EE4C2C" },
  { label: "GenAI", Icon: SiGooglegemini, color: "#8E75B2", mutedLabel: true },
  { label: "LLMs", Icon: SiOpenai, color: "#412991" },
  { label: "DevOps", Icon: SiDocker, color: "#2496ED" },
  { label: "Java", Icon: DiJava, color: "#007396", mutedLabel: true },
  { label: "SpringBoot", Icon: SiSpringboot, color: "#6DB33F" },
  { label: "Backend", Icon: SiNodedotjs, color: "#339933", mutedLabel: true },
  { label: "Deep Learning", Icon: SiTensorflow, color: "#FF6F00" },
];

export function TechStackStrip() {
  return (
    <div className="relative border-t border-border bg-[var(--cream-soft)]/60">
      <div className="page-container flex flex-wrap items-center gap-x-3 gap-y-3 py-3 sm:justify-between sm:gap-x-6 sm:gap-y-4 sm:py-5">
        <span className="label-mono w-full text-[11px] text-foreground sm:w-auto sm:text-[13px]">Tech Stack</span>

        {TECH_STACK.map(({ label, Icon, color, mutedLabel }) => (
          <div key={label} className="flex flex-col items-center gap-1 sm:gap-2">
            <Icon
              className="h-7 w-7 sm:h-10 sm:w-10"
              style={{ color }}
              aria-hidden
            />
            <span
              className={`font-display text-[11px] font-semibold tracking-tight sm:text-[17px] ${
                mutedLabel ? "text-foreground/70" : "text-accent"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
