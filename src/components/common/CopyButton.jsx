import { useState } from 'react';
import Button from './Button';

export default function CopyButton({ text, className }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <Button variant="secondary" size="sm" onClick={handleCopy} className={className}>
      {copied ? '✓ Copiat' : 'Copy'}
    </Button>
  );
}