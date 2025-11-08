import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Label, Track, User, Post, LabelEvent, Opportunity, LabelTheme, Comment } from '../types';
import { getLabelById, getTracksByLabelId, getArtistsByLabelId, getPostsByLabelId, getEventsByLabelId, addCommentToTrack, addCommentToLabel } from '../services/firebaseService';
import { generateLabelTheme } from '../services/geminiService';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import TrackCard from '../components/TrackCard';
import PostCard from '../components/PostCard';
import EventCard from '../components/EventCard';
import { Icon } from '../components/Icon';
import FeaturedReleaseCard from '../components/FeaturedReleaseCard';
import LabelArtistCard from '../components/LabelArtistCard';
import ArtistFocusView from '../components/ArtistFocusView';
import OpportunityCard from '../components/OpportunityCard';
import LabelChatPanel from '../components/LabelChatPanel';
import NewsletterSignup from '../components/NewsletterSignup';
import CommentModal from '../components/CommentModal';
import CommentSection from '../components/CommentSection';

type LabelTab = 'releases' | 'artists' | 'about' | 'posts' | 'events' | 'opportunities' | 'chat';

const LabelPage: React.FC = () => {
  const { labelId } = useParams<{ labelId: string }>();
  const [label, setLabel] = useState<Label | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [artists, setArtists] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<LabelEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LabelTab>('releases');
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [theme, setTheme] = useState<LabelTheme | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<User | null>(null);
  const [commentModalTarget, setCommentModalTarget] = useState<Track | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!labelId) return;
      setLoading(true);
      try {
        const [labelData, tracksData, artistsData, postsData, eventsData] = await Promise.all([
          getLabelById(labelId),
          getTracksByLabelId(labelId),
          getArtistsByLabelId(labelId),
          getPostsByLabelId(labelId),
          getEventsByLabelId(labelId),
        ]);
        setLabel(labelData || null);
        setTracks(tracksData);
        setArtists(artistsData);
        setPosts(postsData);
        setEvents(eventsData);
        if (labelData?.theme) {
            setTheme(labelData.theme);
        }
      } catch (error) {
        console.error("Failed to fetch label data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [labelId]);

  const handleGenerateTheme = async () => {
    if (!label) return;
    setIsGeneratingTheme(true);
    try {
        const newTheme = await generateLabelTheme(label.name, label.bio);
        setTheme(newTheme);
    } catch (error) {
        console.error("AI theme generation failed:", error);
        alert("Sorry, we couldn't generate a new theme right now.");
    } finally {
        setIsGeneratingTheme(false);
    }
  };
  
  const handleAddTrackComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!commentModalTarget) return;
    try {
        const newComment = await addCommentToTrack(commentModalTarget.id, commentData);
        const updatedTarget = { ...commentModalTarget, comments: [...(commentModalTarget.comments || []), newComment] };
        setCommentModalTarget(updatedTarget);
        setTracks(prev => prev.map(t => t.id === updatedTarget.id ? updatedTarget : t));
    } catch (error) {
        console.error("Failed to add comment to track:", error);
    }
  };
  
  const handleAddLabelComment = async (commentData: Omit<Comment, 'id' | 'createdAt'>) => {
    if (!label) return;
    try {
        const newComment = await addCommentToLabel(label.id, commentData);
        setLabel(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null);
    } catch (error) {
        console.error("Failed to add comment to label:", error);
    }
  };

  const featuredRelease = label?.featuredReleaseId ? tracks.find(t => t.id === label.featuredReleaseId) : null;
  const otherReleases = label?.featuredReleaseId ? tracks.filter(t => t.id !== label.featuredReleaseId) : tracks;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'releases':
        return (
          <div>
            {featuredRelease && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">Featured Release</h2>
                    <FeaturedReleaseCard track={featuredRelease} onViewComments={setCommentModalTarget} />
                </div>
            )}
            <h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wider">All Releases</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {otherReleases.map(track => <TrackCard key={track.id} track={track} onViewComments={setCommentModalTarget} />)}
            </div>
          </div>
        );
      case 'artists':
        return (
          <div className="space-y-8">
            {artists.map(artist => (
                <LabelArtistCard 
                    key={artist.id} 
                    artist={artist} 
                    tracks={tracks.filter(t => t.artistId === artist.id).slice(0, 3)} 
                    onViewMore={() => setSelectedArtist(artist)}
                />
            ))}
          </div>
        );
      case 'about':
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-gray-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
                        <p className="text-gray-300 whitespace-pre-line leading-relaxed">{label?.bio}</p>
                    </div>
                     <div className="bg-gray-800 rounded-lg p-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Community Feedback</h2>
                        <CommentSection comments={label?.comments || []} onAddComment={handleAddLabelComment} />
                    </div>
                    {label?.eventPhotos && label.eventPhotos.length > 0 && (
                         <div className="bg-gray-800 rounded-lg p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Event Photos</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {label.eventPhotos.map((url, index) => (
                                    <img key={index} src={url} alt={`Label event photo ${index + 1}`} className="w-full h-40 object-cover rounded-md shadow-lg" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 space-y-8">
                    <NewsletterSignup />
                    {label?.storeLinks && (
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Stores</h3>
                            <div className="space-y-3">
                                {label.storeLinks.map(link => (
                                    <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.name} className="bg-gray-700 p-4 rounded-lg flex items-center gap-4 hover:bg-gray-600 transition-colors">
                                        <Icon name={link.icon} className="w-6 h-6 text-brand-accent"/>
                                        <span className="font-bold text-white">{link.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
      case 'posts':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            {posts.map(post => <PostCard key={post.id} post={post} />)}
          </div>
        );
       case 'events':
        return (
          <div className="space-y-6 max-w-4xl mx-auto">
            {events.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        );
       case 'opportunities':
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                {label?.opportunities?.map(opp => <OpportunityCard key={opp.id} opportunity={opp} labelId={label.id} />)}
            </div>
        )
       case 'chat':
        return <div className="max-w-4xl mx-auto"><LabelChatPanel /></div>
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{tab: LabelTab; label: string; count?: number}> = ({tab, label, count}) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors border-b-2 whitespace-nowrap ${
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
  );

  if (loading) return <Spinner />;
  if (!label) return <div className="text-center text-white">Label not found.</div>;

  return (
    <div>
        {commentModalTarget && (
            <CommentModal
                isOpen={!!commentModalTarget}
                onClose={() => setCommentModalTarget(null)}
                title={`Comments for ${commentModalTarget.title}`}
                comments={commentModalTarget.comments || []}
                onAddComment={handleAddTrackComment}
            />
        )}
        {selectedArtist && <ArtistFocusView artist={selectedArtist} onClose={() => setSelectedArtist(null)} />}

      <div className="relative h-48 md:h-64 bg-gray-800 rounded-lg overflow-hidden mb-[-80px]">
        <img src={theme?.bannerUrl || label.bannerUrl} alt={`${label.name} banner`} className="w-full h-full object-cover opacity-40 transition-all duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </div>

      <div className="relative px-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
          <img src={label.logoUrl} alt={`${label.name} logo`} className="w-40 h-40 rounded-full object-cover border-4 border-gray-900 flex-shrink-0"/>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-bold text-white">{label.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
             <Button onClick={() => alert('Contact form coming soon!')} variant="secondary">Contact</Button>
             <Button onClick={handleGenerateTheme} isLoading={isGeneratingTheme} variant="secondary">Generate Theme</Button>
             <Button>Follow Label</Button>
          </div>
        </div>
      </div>
      
      <div className="my-8 max-w-5xl mx-auto">
        <LabelChatPanel />
      </div>

      <div className="mt-8 border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4 overflow-x-auto">
            <TabButton tab="releases" label="Releases" count={tracks.length} />
            <TabButton tab="artists" label="Artists" count={artists.length} />
            <TabButton tab="about" label="About" />
            <TabButton tab="events" label="Events" count={events.length} />
            <TabButton tab="opportunities" label="Opportunities" count={label.opportunities?.length} />
            <TabButton tab="chat" label="Live Chat" />
            <TabButton tab="posts" label="Posts" count={posts.length} />
        </nav>
      </div>
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default LabelPage;
