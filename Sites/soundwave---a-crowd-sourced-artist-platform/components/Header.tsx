import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Icon } from './Icon';
import { User } from '../types';

interface HeaderProps {
  currentUser?: User | null;
}

const Header: React.FC<HeaderProps> = ({ currentUser }) => {
  const activeLinkStyle = {
    color: 'white',
    backgroundColor: '#282828'
  };

  return (
    <header className="bg-gray-800 sticky top-0 z-40 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <Icon name="logo" className="h-8 w-8 text-brand-accent" />
              <span className="font-bold text-xl">SoundWave</span>
            </Link>
            <nav className="hidden md:flex space-x-2">
              <NavLink 
                to="/" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Home
              </NavLink>
              <NavLink 
                to="/library" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Library
              </NavLink>
               <NavLink 
                to="/playlists" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Playlists
              </NavLink>
              <NavLink 
                to="/labels" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Labels
              </NavLink>
               <NavLink 
                to="/artist-hub" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Artist Hub
              </NavLink>
              <NavLink 
                to="/live-streams" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Live
              </NavLink>
              <NavLink 
                to="/community" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Community
              </NavLink>
              <NavLink 
                to="/tutorials" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Tutorials
              </NavLink>
              <NavLink 
                to="/masterclass" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Masterclass
              </NavLink>
               <NavLink 
                to="/samples" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Samples
              </NavLink>
              <NavLink 
                to="/upload" 
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                 style={({ isActive }) => isActive ? activeLinkStyle : {}}
              >
                Upload
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for tracks or artists..."
                className="bg-gray-700 text-white placeholder-gray-400 border border-transparent focus:ring-2 focus:ring-brand-accent focus:border-transparent rounded-full py-2 px-4 w-64 transition-all"
              />
              <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
            </div>
            
            <Link to="/inbox" className="relative text-gray-400 hover:text-white transition-colors">
                <Icon name="mail" className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">3</span>
            </Link>

            <Link to={`/profile/${currentUser?.id || 'user_1'}`} className="flex items-center space-x-2">
              <img 
                className="h-8 w-8 rounded-full object-cover" 
                src={currentUser?.avatarUrl || 'https://picsum.photos/id/1015/100/100'} 
                alt={`${currentUser?.name || 'User'} Avatar`} 
              />
              <span className="text-white font-medium hidden sm:block">{currentUser?.name || 'Guest'}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;