import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { auth, getUserById, createOrUpdateUser } from '../services/firebaseService';
import Button from '../components/Button';
import { Icon } from '../components/Icon';
import Spinner from '../components/Spinner';

const ProfileSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [artistName, setArtistName] = useState('');
  const [bio, setBio] = useState('');
  const [genre, setGenre] = useState('');
  const [location, setLocation] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/');
        return;
      }
      try {
        const profile = await getUserById(currentUser.uid);
        if (profile) {
          setUser(profile);
          setArtistName(profile.name || '');
          setBio(profile.bio || '');
          setGenre(profile.genre || '');
          setLocation(profile.location || '');
          setSpotifyUrl(profile.spotifyUrl || '');
          setSoundcloudUrl(profile.soundcloudUrl || '');
          setInstagramUrl(profile.instagramUrl || '');
          setTwitterUrl(profile.twitterUrl || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updatedData: Partial<User> = {
        id: user.id,
        name: artistName,
        bio: bio,
        genre: genre,
        location: location,
        spotifyUrl: spotifyUrl || undefined,
        soundcloudUrl: soundcloudUrl || undefined,
        instagramUrl: instagramUrl || undefined,
        twitterUrl: twitterUrl || undefined,
      };
      await createOrUpdateUser(updatedData);
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate(`/profile/${user.id}`), 1500);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  if (!user) return <div className="text-center text-white py-20"><p>Profile not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="mb-8">
        <button onClick={() => navigate(`/profile/${user.id}`)} className="flex items-center text-gray-400 hover:text-white transition-colors mb-4">
          <Icon name="arrow-left" className="w-5 h-5 mr-2" />Back to Profile
        </button>
        <h1 className="text-4xl font-bold">Edit Profile</h1>
        <p className="text-gray-400 mt-2">Update your SoundWave artist profile</p>
      </div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">{error}</div>}
      {success && <div className="mb-6 p-4 bg-green-500/10 border border-green-500 rounded-lg text-green-500">{success}</div>}
      <div className="bg-gray-800 rounded-lg p-8 space-y-6">
        <div><label className="block text-sm font-medium mb-2">Artist Name *</label><input type="text" value={artistName} onChange={(e) => setArtistName(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="Your artist name" /></div>
        <div><label className="block text-sm font-medium mb-2">Bio *</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="Tell us about yourself and your music..." /><p className="text-sm text-gray-400 mt-1">{bio.length}/500 characters</p></div>
        <div><label className="block text-sm font-medium mb-2">Primary Genre *</label><input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="e.g., Drum & Bass, House, Techno" /></div>
        <div><label className="block text-sm font-medium mb-2">Location</label><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="e.g., Los Angeles, CA" /></div>
        <div className="border-t border-gray-700 pt-6"><h3 className="text-xl font-semibold mb-4">Social Links (Optional)</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">Spotify</label><input type="url" value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="https://open.spotify.com/artist/..." /></div><div><label className="block text-sm font-medium mb-2">SoundCloud</label><input type="url" value={soundcloudUrl} onChange={(e) => setSoundcloudUrl(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="https://soundcloud.com/..." /></div><div><label className="block text-sm font-medium mb-2">Instagram</label><input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="https://instagram.com/..." /></div><div><label className="block text-sm font-medium mb-2">Twitter/X</label><input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-brand-accent focus:border-transparent" placeholder="https://twitter.com/..." /></div></div></div>
        <div className="flex gap-4 pt-6 border-t border-gray-700"><Button onClick={handleSave} disabled={saving || !artistName || !bio || !genre} className="flex-1">{saving ? 'Saving...' : 'Save Changes'}</Button><Button onClick={() => navigate(`/profile/${user.id}`)} variant="secondary">Cancel</Button></div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
