
import React from 'react';
import { AtomIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="border-b border-border py-4">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AtomIcon className="h-8 w-8 text-quantum-teal animate-quantum-pulse" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-quantum-teal to-quantum-purple bg-clip-text text-transparent">
              Quantum Route Navigator
            </h1>
            <p className="text-sm text-muted-foreground">
              Vehicle Routing Problem Solver with QAOA by Arnab Rai and Harsh Raj
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary rounded-full text-xs">
            <div className="w-2 h-2 rounded-full bg-quantum-teal"></div>
            <span>Quantum Simulator Active</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
