function Card({ 
  children, 
  className = '', 
  variant = 'default',
  onClick,
  hoverable = false,
}) {
  const variants = {
    default: 'card',
    warm: 'card-warm',
    flat: 'bg-cream-50 rounded-2xl border border-cream-200',
  };

  return (
    <div 
      className={`${variants[variant]} ${hoverable ? 'cursor-pointer hover:-translate-y-1' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-4 md:p-6 border-b border-cream-100 ${className}`}>
      {children}
    </div>
  );
}

function CardBody({ children, className = '' }) {
  return (
    <div className={`p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}

function CardFooter({ children, className = '' }) {
  return (
    <div className={`p-4 md:p-6 border-t border-cream-100 ${className}`}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

