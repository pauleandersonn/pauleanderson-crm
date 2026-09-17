import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
    src,
    alt,
    className,
    fallbackSrc,
    ...props
}) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleError = () => {
        if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackSrc);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    return (
        <div className={`relative overflow-hidden ${className} bg-slate-100`}>
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
                    <Loader2 className="animate-spin text-slate-400" size={24} />
                </div>
            )}

            {hasError && !imgSrc ? (
                <div className="flex flex-col items-center justify-center w-full h-full bg-slate-200 text-slate-400 p-4">
                    <ImageOff size={32} />
                    <span className="text-xs mt-2 text-center">Imagem indisponível</span>
                </div>
            ) : (
                <img
                    {...props}
                    src={imgSrc}
                    alt={alt}
                    className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
                    onError={handleError}
                    onLoad={handleLoad}
                />
            )}
        </div>
    );
};

export default ImageWithFallback;
