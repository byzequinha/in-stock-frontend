"use client";

interface LogoProps {
    width?: number;
    height?: number;
}

const Logo: React.FC<LogoProps> = ({ width = 60, height = 48 }) => {
    return (
        <img
            src="/assets/logo.png"
            alt="Logo do InStock"
            className="block"
            style={{ width: `${width}px`, height: `${height}px` }}
            onError={(e) => {
                e.currentTarget.src = '/fallback-logo.png'; // Substitua por um logo padrão, se necessário.
                e.currentTarget.alt = 'Logo não encontrado';
            }}
        />
    );
};

export default Logo;
