import Image from 'next/image';

interface LogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const Logo = ({ width = 180, height = 143, className }: LogoProps) => (
  <div className={`relative ${className || ''}`} style={{ width, height }}>
    <Image
      src="/assets/logo.png"
      alt="Logo InStock"
      fill
      priority
      style={{ objectFit: 'contain' }}
    />
  </div>
);

export default Logo;
