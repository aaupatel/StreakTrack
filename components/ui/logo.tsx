import logoIcon from '../../public/logo.png';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 100 }: LogoProps) {
  return (
    <Image
      src={logoIcon}
      alt="StreakTrack Logo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}