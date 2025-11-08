import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { User, Track, ExternalRelease, PremiumPack, RekordboxTrack, Comment } from '../types';
import { getUserById, getTracksByArtist, getExternalReleasesByArtist, getPremiumPacksByArtist, addCommentToTrack } from '../services/firebaseService';
import Spinner from '../components/Spinner';
import TrackCard from '../components/TrackCard';
import ArtistReleasesPanel from '../components/ArtistReleasesPanel';
import PremiumPackCard from '../components/PremiumPackCard';
import Button from '../components/Button';
import CollectionTable from '../components/CollectionTable';
import { Icon } from '../components/Icon';
import CommentModal from '../components/CommentModal';

type ProfileTab = 'tracks' | 'releases' | 'packs' | 'collection';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();

  const [user, setUser] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [releases, setReleases] = useState<ExternalRelease[]>([]);
  const [packs, setPacks] = useState<PremiumPack[]>([]);
  const [collection, setCollection] = useState<RekordboxTrack[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('tracks');
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentModalTarget, setCommentModalTarget] = useState<Track | null>(null);

  useEffect(() => {
    if (location.state?.collection) {
        setCollection(location.state.collection);
        setActiveTab('collection');
        // Clear the state from location history to prevent re-triggering on refresh
        window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      const [fetchedUser, fetchedTracks, fetchedReleases, fetchedPacks] = await Promise.all([
        getUserById(userId),
        getTracksByArtist(userId),
        getExternalReleasesByArtist(userId),
        getPremiumPacksByArtist(userId)
      ]);
      setUser(fetchedUser || null);
      setTracks(fetchedTracks);
      setReleases(fetchedReleases);
      setPacks(fetchedPacks);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  const handleFollowToggle = () => {
    setIsFollowing(prev => !prev);
  };
  
  const handleAddComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!commentModalTarget) return;
    try {
      const newComment = await addCommentToTrack(commentModalTarget.id, commentData);
      const updatedTarget = { ...commentModalTarget, comments: [...(commentModalTarget.comments || []), newComment]};
      setCommentModalTarget(updatedTarget);
      setTracks(prevTracks => prevTracks.map(t => t.id === updatedTarget.id ? updatedTarget : t));
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracks':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks.map(track => (
              <TrackCard key={track.id} track={track} onViewComments={setCommentModalTarget} />
            ))}
          </div>
        );
      case 'releases':
        return <ArtistReleasesPanel releases={releases} />;
      case 'packs':
        return (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map(pack => (
              <PremiumPackCard key={pack.id} pack={pack} />
            ))}
          </div>
        );
      case 'collection':
        if (collection) {
            return <CollectionTable collection={collection} />;
        }
        return (
            <div className="text-center py-20 px-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                <Icon name="playlist" className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-2xl font-semibold text-white">Your Music Collection is Empty</h3>
                <p className="text-gray-400 mt-2 mb-6 max-w-md mx-auto">Import your Rekordbox XML file to see all your tracks, organize them, and build playlists.</p>
                <Link to="/import-collection">
                    <Button>
                        <Icon name="upload" className="w-5 h-5 mr-2" />
                        Import Your Collection
                    </Button>
                </Link>
            </div>
        )
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{tab: ProfileTab; label: string; count?: number}> = ({tab, label, count}) => {
    return (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 ${
                activeTab === tab 
                ? 'text-white border-brand-accent bg-gray-700/50' 
                : 'text-gray-400 border-transparent hover:text-white hover:border-gray-500'
            }`}
        >
            {label} 
            {typeof count !== 'undefined' && count > 0 && 
                <span className="text-xs bg-gray-600 rounded-full px-2 py-0.5 ml-1">{count}</span>
            }
        </button>
    )
  }

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return <div className="text-center text-white">User not found.</div>;
  }

  return (
    <div className="text-white">
      {commentModalTarget && (
        <CommentModal
          isOpen={!!commentModalTarget}
          onClose={() => setCommentModalTarget(null)}
          title={`Comments for ${commentModalTarget.title}`}
          comments={commentModalTarget.comments || []}
          onAddComment={handleAddComment}
        />
      )}
      <div className="bg-gray-800 rounded-lg p-8 mb-8 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
        <img src={user.avatarUrl} alt={user.name} className="w-40 h-40 rounded-full object-cover border-4 border-gray-700 flex-shrink-0" />
        <div className="flex-grow w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-4xl font-bold">{user.name}</h1>
            <Button
              onClick={handleFollowToggle}
              variant={isFollowing ? 'secondary' : 'primary'}
              className="w-full sm:w-auto flex-shrink-0"
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
          <p className="text-gray-400 mt-2 max-w-xl">{user.bio}</p>
        </div>
      </div>
      
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4">
            <TabButton tab="tracks" label="All Tracks" count={tracks.length} />
            <TabButton tab="releases" label="External Releases" count={releases.length} />
            <TabButton tab="packs" label="Premium Packs" count={packs.length} />
            <TabButton tab="collection" label="My Collection" count={collection?.length || 0} />
        </nav>
      </div>

      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
