import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface InlineEditProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  validate?: (value: string) => string | null;
}

export function InlineEdit({
  value,
  onSave,
  className,
  placeholder = 'Click to edit',
  multiline = false,
  validate,
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    if (validate) {
      const validationError = validate(editValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }
    setError(null);
    setIsEditing(false);
    if (editValue !== value) {
      onSave(editValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    const commonProps = {
      ref: inputRef as any,
      value: editValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: cn(
        'w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary/50',
        className
      ),
      placeholder,
    };

    return multiline ? (
      <textarea {...commonProps} rows={3} />
    ) : (
      <input type="text" {...commonProps} />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        'cursor-pointer hover:bg-muted/50 px-2 py-1 rounded inline-block min-w-[60px]',
        !value && 'text-muted-foreground italic',
        className
      )}
    >
      {value || placeholder}
    </span>
  );
}
