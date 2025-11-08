
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} SoundWave. All rights reserved. A crowd-sourced artist platform.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
