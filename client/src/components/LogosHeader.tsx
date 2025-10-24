interface LogosHeaderProps {
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function LogosHeader({ showText = true, size = 'medium' }: LogosHeaderProps) {
  const sizes = {
    small: { logo: 'h-12', text: 'text-sm' },
    medium: { logo: 'h-16', text: 'text-base' },
    large: { logo: 'h-24', text: 'text-lg' },
  };

  const currentSize = sizes[size];

  return (
    <div className="flex items-center justify-center gap-6 mb-6">
      {/* شعار مسجد النور */}
      <div className="flex flex-col items-center">
        <img 
          src="/logos/mosque-logo.jpeg" 
          alt="مسجد النور الجديدة" 
          className={`${currentSize.logo} object-contain`}
        />
        {showText && (
          <p className={`${currentSize.text} font-semibold text-gray-700 mt-2 text-center`}>
            مسجد النور الجديدة
          </p>
        )}
      </div>

      {/* شعار مركز نور الهدى */}
      <div className="flex flex-col items-center">
        <img 
          src="/logos/noor-alhuda-logo.jpeg" 
          alt="مركز نور الهدى" 
          className={`${currentSize.logo} object-contain`}
        />
        {showText && (
          <p className={`${currentSize.text} font-semibold text-gray-700 mt-2 text-center`}>
            مركز نور الهدى للقرآن الكريم
          </p>
        )}
      </div>
    </div>
  );
}

