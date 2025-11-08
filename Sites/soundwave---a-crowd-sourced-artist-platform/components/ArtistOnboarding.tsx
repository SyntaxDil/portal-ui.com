import React, { useState } from 'react';
import { User } from '../types';
import { createOrUpdateUser, uploadUserAvatar } from '../services/firebaseService';
import Button from './Button';
import { Icon } from './Icon';

interface ArtistOnboardingProps {
  onComplete: (user: User) => void;
  currentUserId: string;
  currentUserEmail: string;
}

const ArtistOnboarding: React.FC<ArtistOnboardingProps> = ({ onComplete, currentUserId, currentUserEmail }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [genre, setGenre] = useState('');
  const [customGenre, setCustomGenre] = useState('');
  const [showCustomGenre, setShowCustomGenre] = useState(false);
  const [location, setLocation] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  // Expanded genre list
  const [genres, setGenres] = useState([
    'Electronic', 'Hip Hop', 'Pop', 'Rock', 'Jazz', 'Classical', 'R&B', 'Soul',
    'Country', 'Reggae', 'Latin', 'Indie', 'Alternative', 'Metal', 'Punk',
    'Folk', 'Blues', 'Funk', 'Disco', 'House', 'Techno', 'Trance', 'Dubstep',
    'Drum & Bass', 'Trap', 'Lo-Fi', 'Ambient', 'Experimental', 'World', 'Gospel',
    'K-Pop', 'J-Pop', 'Afrobeat', 'Dancehall', 'Garage', 'Grime', 'Hardstyle',
    'Progressive', 'Psychedelic', 'Synthwave', 'Vaporwave', 'Chillwave'
  ]);
  
  // Social links
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomGenre(true);
      setGenre('');
    } else {
      setShowCustomGenre(false);
      setGenre(value);
      setCustomGenre('');
    }
  };

  const handleAddCustomGenre = () => {
    if (customGenre.trim().length > 0) {
      const newGenre = customGenre.trim();
      // Add to genres list if not already there
      if (!genres.includes(newGenre)) {
        setGenres([...genres, newGenre].sort());
      }
      setGenre(newGenre);
      setCustomGenre('');
      setShowCustomGenre(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Upload avatar if provided
      let avatarUrl = 'https://picsum.photos/id/1015/200/200'; // Default avatar
      if (avatarFile) {
        avatarUrl = await uploadUserAvatar(avatarFile, currentUserId);
      }
      
      // Create user profile
      const userData: Partial<User> = {
        id: currentUserId,
        name: artistName,
        bio: bio,
        genre: genre,
        location: location,
        avatarUrl: avatarUrl,
        spotifyUrl: spotifyUrl || undefined,
        soundcloudUrl: soundcloudUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
        followers: 0,
        following: 0,
        isVerified: false,
      };
      
      const createdUser = await createOrUpdateUser(userData);
      onComplete(createdUser);
    } catch (err: any) {
      console.error('Error creating artist profile:', err);
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid = artistName.trim().length >= 2;
  const isStep2Valid = bio.trim().length >= 10 && genre.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center">
          <Icon name="music-note" className="w-16 h-16 mx-auto mb-4 text-white" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to SoundWave!</h1>
          <p className="text-white/90">Let's create your artist profile</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4 p-6 border-b border-gray-700">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-purple-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-purple-500 text-white' : 'bg-gray-700'}`}>
              1
            </div>
            <span className="font-medium hidden sm:inline">Basic Info</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700"></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-purple-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-purple-500 text-white' : 'bg-gray-700'}`}>
              2
            </div>
            <span className="font-medium hidden sm:inline">About You</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700"></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-purple-500' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-purple-500 text-white' : 'bg-gray-700'}`}>
              3
            </div>
            <span className="font-medium hidden sm:inline">Social Links</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  placeholder="Enter your artist name"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  maxLength={50}
                />
                <p className="text-xs text-gray-400 mt-1">This is how you'll appear on SoundWave</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Icon name="user" className="w-12 h-12 text-gray-500" />
                    )}
                  </div>
                  <label className="cursor-pointer">
                    <div className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors">
                      Choose Image
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Los Angeles, CA"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Bio *
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your music and journey..."
                  rows={5}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1">{bio.length}/500 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Genre *
                </label>
                <select
                  value={showCustomGenre ? 'custom' : genre}
                  onChange={handleGenreChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a genre</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                  <option value="custom">➕ Add Custom Genre</option>
                </select>
                
                {showCustomGenre && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={customGenre}
                      onChange={(e) => setCustomGenre(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomGenre()}
                      placeholder="Enter your genre (e.g., Future Bass)"
                      className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={30}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomGenre}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                )}
                
                {genre && !showCustomGenre && (
                  <p className="text-xs text-green-400 mt-2">✓ Selected: {genre}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Social Links */}
          {step === 3 && (
            <div className="space-y-6">
              <p className="text-gray-400 text-sm">Connect your social profiles (optional)</p>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Icon name="spotify" className="w-4 h-4 inline mr-2" />
                  Spotify
                </label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/artist/..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Icon name="soundcloud" className="w-4 h-4 inline mr-2" />
                  SoundCloud
                </label>
                <input
                  type="url"
                  value={soundcloudUrl}
                  onChange={(e) => setSoundcloudUrl(e.target.value)}
                  placeholder="https://soundcloud.com/..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Icon name="instagram" className="w-4 h-4 inline mr-2" />
                  Instagram
                </label>
                <input
                  type="url"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Icon name="twitter" className="w-4 h-4 inline mr-2" />
                  Twitter/X
                </label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-700 flex justify-between">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="secondary"
              disabled={loading}
            >
              Back
            </Button>
          )}
          
          <div className="ml-auto">
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStep1Valid || !isStep2Valid}
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistOnboarding;
