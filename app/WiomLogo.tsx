import Image from "next/image";

export default function WiomLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="inline-flex items-center gap-1.5 dark:hidden">
        <Image src="/wiom-logo.png" alt="Wiom" width={28} height={28} />
        <span className="font-logo text-2xl font-extrabold tracking-tight text-[#ec0a7a]">Wiom</span>
      </span>
      <Image
        src="/wiom-logo-dark.png"
        alt="Wiom"
        width={130}
        height={28}
        className="hidden dark:block"
      />
    </span>
  );
}
