/**
 * Skip Navigation Link Component
 *
 * Provides keyboard-accessible skip navigation for WCAG 2.4.1 compliance.
 * Hidden by default, appears on focus for keyboard users.
 */

import React from 'react';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href = "#main-content",
  children = "Skip to main content"
}) => (
  <a
    href={href}
    className="skip-link"
  >
    {children}
  </a>
);

export default SkipLink;
