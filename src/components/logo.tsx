"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function Logo({ is_responsive = false }: { is_responsive?: boolean }) {
  const router = useRouter();

  const handle_click = () => {
    router.push("/");
  };

  return (
    <div
      className="flex items-center space-x-4 cursor-pointer"
      onClick={handle_click}
    >
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
