import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ is_responsive = false }: { is_responsive?: boolean }) {
  return (
    <div className="flex items-center space-x-4">
      <Image src="/logo.svg" alt="Logo" width={13} height={30} />
      <span
        className={cn(
          "text-xl font-bold block",
          is_responsive && "hidden sm:block"
        )}
      >
        Stand<em className="text-primary not-italic">Sync</em>
      </span>
    </div>
  );
}
