import { useEffect } from 'react';

// Tawk.to Live Chat Widget
// Sign up at https://www.tawk.to/ and replace the property ID
export const LiveChat: React.FC = () => {
  useEffect(() => {
    // Tawk.to Script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/PROPERTY_ID/default';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    // Only load in production or when configured
    const propertyId = import.meta.env.VITE_TAWK_PROPERTY_ID;
    if (propertyId) {
      script.src = `https://embed.tawk.to/${propertyId}/default`;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup
      const tawkScript = document.querySelector('script[src*="tawk.to"]');
      if (tawkScript) {
        tawkScript.remove();
      }
    };
  }, []);

  return null;
};

// Alternative: Crisp Chat Widget
export const CrispChat: React.FC = () => {
  useEffect(() => {
    const websiteId = import.meta.env.VITE_CRISP_WEBSITE_ID;
    if (!websiteId) return;

    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const crispScript = document.querySelector('script[src*="crisp.chat"]');
      if (crispScript) crispScript.remove();
    };
  }, []);

  return null;
};
