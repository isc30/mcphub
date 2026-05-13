import React, { ReactNode } from 'react';

interface ContentProps {
  children: ReactNode;
}

const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <main className="page-content">
      {children}
    </main>
  );
};

export default Content;
