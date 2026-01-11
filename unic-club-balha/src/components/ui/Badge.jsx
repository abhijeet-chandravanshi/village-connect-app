const variants = {
  primary: 'bg-primary-100 text-primary-700',
  saffron: 'bg-saffron-100 text-saffron-700',
  leaf: 'bg-leaf-100 text-leaf-700',
  earth: 'bg-earth-100 text-earth-700',
  pending: 'bg-saffron-100 text-saffron-700',
  verified: 'bg-leaf-100 text-leaf-700',
  rejected: 'bg-red-100 text-red-700',
  upcoming: 'bg-saffron-100 text-saffron-700',
  ongoing: 'bg-primary-100 text-primary-700',
  completed: 'bg-leaf-100 text-leaf-700',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

function Badge({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  dot = false,
}) {
  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current`} />
      )}
      {children}
    </span>
  );
}

export default Badge;

