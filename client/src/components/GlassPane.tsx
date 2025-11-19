
import React from 'react';

interface GlassPaneProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerAction?: React.ReactNode;
}

export const GlassPane: React.FC<GlassPaneProps> = ({ children, className = '', title, headerAction }) => {
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 ${className}`}>
      {(title || headerAction) && (
        <div className="px-5 py-3 border-b border-white/50 flex justify-between items-center bg-white/30">
          {title && (
            <h3 className="text-sm font-bold tracking-wide text-web3-primary uppercase font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"></span>
              {title}
            </h3>
          )}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="flex-1 relative">
        {children}
      </div>
    </div>
  );
};
