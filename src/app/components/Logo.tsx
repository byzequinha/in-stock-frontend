import Image from 'next/image';

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => (
  <div className={`relative ${className || 'w-[180px] h-[143px]'}`}>
    <Image
      src="/assets/logo.png"
      alt="Logo InStock"
      fill
      priority
      sizes="(max-width: 768px) 50vw, 100vw"
      className="object-contain"
    />
  </div>
);

export default Logo;