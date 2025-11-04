import { User, Track, UploadType, Post, GlobalEvent, GlobalEventType, ExternalRelease, PremiumPack, RadioStation, LiveRoom, CommunityPlaylist, Tutorial, Masterclass, SamplePack, Label, LabelEvent, Conversation, DirectMessage, Opportunity, PostAudience, Comment } from '../types';

const users: User[] = [
  { 
    id: 'user_1', 
    name: 'Sub-Tropical', 
    avatarUrl: 'https://picsum.photos/id/1015/200/200', 
    bio: 'Weaving deep, rolling basslines with atmospheric pads and intricate breaks. Welcome to the concrete jungle.',
    interview: [
        { question: "What's the story behind your name?", answer: "It's all about the fusion. The 'Sub' is for the deep bass frequencies I love, and 'Tropical' represents the atmospheric, jungle-like vibes I try to create. It's that contrast between urban and natural environments." },
        { question: "Who are your biggest influences?", answer: "Definitely the old-school legends like Goldie, Photek, and Dillinja for their breakbeat science. But also film composers like Hans Zimmer for their sense of scale and atmosphere. I try to bring that cinematic feel to a 170bpm tempo." },
        { question: "What's your go-to piece of studio gear?", answer: "It has to be my analog synth, the Moog Sub 37. You just can't replicate that warmth and weight with software. Every bassline I write starts there. It's the heart of my sound." }
    ],
    gallery: [
        "https://picsum.photos/id/1011/800/600",
        "https://picsum.photos/id/1012/800/600",
        "https://picsum.photos/id/1013/800/600"
    ]
  },
  { 
    id: 'user_2', 
    name: 'Re-Flex', 
    avatarUrl: 'https://picsum.photos/id/1016/200/200', 
    bio: 'Heavy-hitting D&B with a focus on deep sub frequencies and technical rhythm patterns. For the heads.',
    interview: [{ question: "Describe your sound in three words.", answer: "Deep, dark, and rolling." }],
    gallery: ["https://picsum.photos/id/201/800/600", "https://picsum.photos/id/202/800/600"]
  },
  { 
    id: 'user_3', 
    name: 'Lioness Vibe', 
    avatarUrl: 'https://picsum.photos/id/1025/200/200', 
    bio: 'Fusing classic reggae and dub culture with the energy of 170bpm jungle. Positive vibrations.',
    interview: [{ question: "What's the message behind your music?", answer: "It's all about unity and positive energy. Taking the soundsystem culture I grew up with and bringing it to the jungle world. It's about respecting the roots." }],
    gallery: ["https://picsum.photos/id/301/800/600", "https://picsum.photos/id/302/800/600"]
  },
];

const mockComments: Comment[] = [
    { id: 'c1', authorId: 'user_2', authorName: 'Re-Flex', authorAvatarUrl: users[1].avatarUrl, content: 'Heavy roller this one!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: 'c2', authorId: 'user_3', authorName: 'Lioness Vibe', authorAvatarUrl: users[2].avatarUrl, content: 'Pure vibes. The atmosphere is incredible.', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
];

const opportunities: Record<string, Opportunity[]> = {
    'label_1': [
        { 
            id: 'opp_1', 
            title: 'Seeking Vocalist for Deep Liquid Track', 
            type: 'Vocalist', 
            description: 'We have a deep, atmospheric liquid track in the works and are looking for a vocalist with a soulful, ethereal style to collaborate with. Please submit demos.',
            comments: [
                { id: 'c1-opp', authorId: 'user_2', authorName: 'Re-Flex', authorAvatarUrl: users[1].avatarUrl, content: 'Sounds interesting. Sent you a DM with a link to a vocalist I worked with before.', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
                { id: 'c2-opp', authorId: 'user_3', authorName: 'Lioness Vibe', authorAvatarUrl: users[2].avatarUrl, content: 'This sounds like a vibe for sure. Good luck finding someone!', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            ]
        },
        { 
            id: 'opp_2', 
            title: 'Graphic Designer for Album Art', 
            type: 'Designer', 
            description: 'We need a talented graphic designer to create the cover art and promotional materials for an upcoming EP. We are looking for a minimalist, abstract style.',
            comments: [
                 { id: 'c3-opp', authorId: 'user_1', authorName: 'Sub-Tropical', authorAvatarUrl: users[0].avatarUrl, content: 'My friend @PixelPusher does amazing work in this style, they should apply!', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
            ]
        },
    ]
}


const labels: Label[] = [
    {
        id: 'label_1',
        name: 'Deep Grooves',
        logoUrl: 'https://picsum.photos/id/237/200/200',
        bannerUrl: 'https://picsum.photos/id/1018/1200/400',
        bio: 'Focused on the deeper, more atmospheric side of drum and bass. We push sounds that are both hypnotic and heavy, for the true heads who appreciate the art of the roller. Our mission is to champion producers who craft immersive soundscapes and push the boundaries of rhythm and bass.',
        artistIds: ['user_1', 'user_2'],
        storeLinks: [
            { name: 'Bandcamp', url: '#', icon: 'bandcamp' },
            { name: 'Merch Store', url: '#', icon: 'package' }
        ],
        featuredReleaseId: 'track_2',
        galleryImageUrls: [
            'https://picsum.photos/id/10/800/600',
            'https://picsum.photos/id/22/800/600',
            'https://picsum.photos/id/30/800/600'
        ],
        opportunities: opportunities['label_1'],
        eventPhotos: [
            'https://picsum.photos/id/1040/800/600',
            'https://picsum.photos/id/1041/800/600',
            'https://picsum.photos/id/1042/800/600',
        ],
        theme: {
            bannerUrl: 'https://picsum.photos/id/1018/1200/400',
            accentColor: '#1DB954'
        },
        comments: [mockComments[0]]
    },
    {
        id: 'label_2',
        name: 'Jungle Massive Recordings',
        logoUrl: 'https://picsum.photos/id/238/200/200',
        bannerUrl: 'https://picsum.photos/id/1019/1200/400',
        bio: 'Bringing the original jungle sound back to the forefront. Raw breakbeats, reggae samples, and chest-rattling basslines are our signature. We honor the roots while pushing the sound into the future.',
        artistIds: ['user_3'],
        storeLinks: [
            { name: 'Bandcamp', url: '#', icon: 'bandcamp' }
        ],
        featuredReleaseId: 'track_3',
        theme: {
            bannerUrl: 'https://picsum.photos/id/1019/1200/400',
            accentColor: '#F59E0B' // Amber
        }
    }
];

const labelEvents: Record<string, LabelEvent[]> = {
    'label_1': [
        { id: 'le_1', title: 'Deep Grooves Label Night', date: '2024-11-15', location: 'Fabric, London', description: 'Join us for a night of deep rollers with the full Deep Grooves roster.', ticketUrl: '#' },
        { id: 'le_2', title: 'Re-Flex Album Launch', date: '2024-12-05', location: 'Watergate, Berlin', description: 'Celebrating the launch of the new album from Re-Flex.' }
    ],
    'label_2': [
        { id: 'le_3', title: 'Jungle Massive Soundclash', date: '2024-11-22', location: 'The Black Swan, Bristol', description: 'A night of classic jungle and dubplates, featuring Lioness Vibe and special guests.', ticketUrl: '#' }
    ]
}

const tracks: Track[] = [
    { 
        id: 'track_1', 
        title: 'Concrete Jungle', 
        artistId: 'user_1', 
        artistName: 'Sub-Tropical', 
        audioSrc: 'https://storage.googleapis.com/jweb-app-media/track_1.mp3', 
        coverArtUrl: 'https://picsum.photos/id/145/400/400', 
        price: 1.29,
        currency: 'USD',
        uploadType: UploadType.SALE,
        description: 'A deep, rolling drum & bass track with lush atmospheric pads and a heavy, off-beat sub bass. Takes you on a journey through the urban wilderness.',
        tags: ['Drum & Bass', 'Jungle', 'Liquid'],
        category: 'Official Release',
        labelId: 'label_1',
        labelName: 'Deep Grooves',
        comments: [...mockComments]
    },
    { 
        id: 'track_2', 
        title: 'Deepwater Horizon (Remix)', 
        artistId: 'user_2', 
        artistName: 'Re-Flex', 
        audioSrc: 'https://storage.googleapis.com/jweb-app-media/track_2.mp3',
        coverArtUrl: 'https://picsum.photos/id/211/400/400',
        price: 0,
        currency: 'USD',
        uploadType: UploadType.FREE,
        description: 'Minimalist, tech-driven D&B. A hypnotic roller with a sub-bass that you feel more than you hear. Intricate percussion and subtle textures create a deep, meditative groove perfect for the late-night hours.',
        tags: ['Deep D&B', 'Techstep', 'Rolling'],
        category: 'Remix',
        sourceSamples: ['"Think" break by Lyn Collins', '808 Sub Bass Patch'],
        labelId: 'label_1',
        labelName: 'Deep Grooves',
        comments: [mockComments[1]]
    },
    { 
        id: 'track_3', 
        title: 'Babylon Fall', 
        artistId: 'user_3', 
        artistName: 'Lioness Vibe', 
        audioSrc: 'https://storage.googleapis.com/jweb-app-media/track_3.mp3',
        coverArtUrl: 'https://picsum.photos/id/310/400/400',
        price: 0,
        currency: 'USD',
        uploadType: UploadType.PREVIEW,
        description: 'Classic reggae vocal samples chopped over a thunderous amen break and a chest-rattling bassline. Pure dubwise jungle pressure, guaranteed to shake the foundations.',
        tags: ['Reggae', 'Jungle', 'Dubwise'],
        category: 'Official Release',
        labelId: 'label_2',
        labelName: 'Jungle Massive Recordings',
        comments: []
    },
     { 
        id: 'track_4', 
        title: 'Amazon Flow', 
        artistId: 'user_1', 
        artistName: 'Sub-Tropical', 
        audioSrc: 'https://storage.googleapis.com/jweb-app-media/track_4.mp3',
        coverArtUrl: 'https://picsum.photos/id/431/400/400', 
        price: 0.99,
        currency: 'USD',
        uploadType: UploadType.SALE,
        description: 'A liquid funk anthem. Smooth, melodic, and uplifting with a clean, rolling beat and warm bass. Perfect for a sunset session.',
        tags: ['Liquid Funk', 'Atmospheric', 'D&B'],
        category: 'Official Release',
        labelId: 'label_1',
        labelName: 'Deep Grooves',
        comments: [mockComments[0], mockComments[1]]
    },
    { 
        id: 'track_5', 
        title: 'Kingston Skank (Bootleg)', 
        artistId: 'user_1', 
        artistName: 'Sub-Tropical', 
        audioSrc: 'https://storage.googleapis.com/jweb-app-media/track_5.mp3',
        coverArtUrl: 'https://picsum.photos/id/454/400/400',
        price: 0,
        currency: 'USD',
        uploadType: UploadType.FREE,
        description: 'Off-beat reggae guitars and horn stabs ride a high-energy 175bpm jungle rhythm track. This is an unofficial bootleg, for promotional use only.',
        tags: ['Jungle', 'Reggae', 'Bootleg'],
        category: 'Bootleg',
        comments: [mockComments[0]]
    },
];

const posts: Post[] = [
  {
    id: 'post_1',
    title: 'Favorite classic Amen break edits?',
    content: 'The Amen break is the foundation! What are some of your favorite, most creative or influential edits of the Amen? Looking for inspiration for my next junglist track. Links appreciated!',
    authorId: 'user_1',
    authorName: 'Sub-Tropical',
    authorAvatarUrl: 'https://picsum.photos/id/1015/100/100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 25,
    replyCount: 2,
    replies: [mockComments[0], mockComments[1]]
  },
  {
    id: 'post_label_1',
    title: 'New Release: Sub-Tropical - Concrete Jungle',
    content: 'Our latest release from the one and only Sub-Tropical is out now on all major platforms! A deep, rolling journey into the concrete jungle. Grab it now on our Bandcamp.',
    authorId: 'label_1',
    authorName: 'Deep Grooves',
    authorAvatarUrl: 'https://picsum.photos/id/237/100/100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    likes: 52,
    replyCount: 1,
    replies: [mockComments[0]]
  },
  {
    id: 'post_2',
    title: 'Best VSTs for creating deep, rolling sub-bass?',
    content: 'I\'m trying to get that really deep, clean, rolling sub that you can feel in your chest. Using Serum right now but wondering what else is out there. Any tips on synthesis or processing chains?',
    authorId: 'user_2',
    authorName: 'Re-Flex',
    authorAvatarUrl: 'https://picsum.photos/id/1016/100/100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 41,
    replyCount: 0,
    replies: []
  },
  {
    id: 'post_3',
    title: 'Who are your favorite reggae/dub artists to sample?',
    content: 'Looking for some fresh (or classic) material to sample for my next jungle tune. Who are your go-to artists for vocal snippets, horn stabs, or basslines? Thinking King Tubby, Lee "Scratch" Perry, etc.',
    authorId: 'user_3',
    authorName: 'Lioness Vibe',
    authorAvatarUrl: 'https://picsum.photos/id/1025/100/100',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    likes: 68,
    replyCount: 1,
    replies: [mockComments[1]]
  },
];

const conversations: Conversation[] = [
    {
        id: 'conv_1',
        participants: [users[0], users[1]],
        unreadCount: 2,
        messages: [
            { id: 'msg_1', senderId: 'user_2', text: 'Yo, that "Concrete Jungle" track is heavy! Serious roller.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
            { id: 'msg_2', senderId: 'user_1', text: 'Thanks man, appreciate that! Your latest remix is sounding huge too.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
            { id: 'msg_3', senderId: 'user_2', text: 'We should collab on something soon.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
            { id: 'msg_4', senderId: 'user_2', text: 'Got a new sub bass technique I want to try out.', timestamp: new Date(Date.now() - 1000 * 60 * 29).toISOString() },
        ]
    },
    {
        id: 'conv_2',
        participants: [users[0], users[2]],
        unreadCount: 1,
        messages: [
            { id: 'msg_5', senderId: 'user_3', text: 'Big up on the jungle vibes recently! Keeping the sound alive.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
            { id: 'msg_6', senderId: 'user_1', text: 'Respect! Your dub influences are a massive inspiration.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
            { id: 'msg_7', senderId: 'user_3', text: 'I\'ve got some rare reggae vocals if you ever need some for a track.', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        ]
    },
     {
        id: 'conv_3',
        participants: [users[0], {id: 'label_1', name: 'Deep Grooves', avatarUrl: 'https://picsum.photos/id/237/200/200', bio:''}],
        unreadCount: 0,
        messages: [
            { id: 'msg_8', senderId: 'label_1', text: 'Hey, just checking in. The promo for "Concrete Jungle" is going great. DJs are loving it.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() },
            { id: 'msg_9', senderId: 'user_1', text: 'Awesome news! Thanks for the update.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 71).toISOString() },
        ]
    }
];

const externalReleases: Record<string, ExternalRelease[]> = {
  'user_1': [
    { id: 'ext_1', platform: 'Spotify', title: 'Concrete Jungle EP', url: '#', isPaid: true, type: 'Official' },
    { id: 'ext_2', platform: 'SoundCloud', title: 'Summer Breeze (Bootleg)', url: '#', isPaid: false, type: 'Bootleg' },
    { id: 'ext_3', platform: 'YouTube', title: 'Amazon Flow (Official Video)', url: '#', isPaid: false, type: 'Official' },
    { id: 'ext_4', platform: 'Bandcamp', title: 'Goldie - Terminator (Sub-Tropical Remix)', url: '#', isPaid: true, type: 'Remix', sourceArtist: 'Goldie', sourceSamples: ['"Terminator" vocal snippet', 'Reese Bassline'] },
  ],
  'user_2': [],
  'user_3': [],
};

const premiumPacks: Record<string, PremiumPack[]> = {
  'user_1': [
    {
      id: 'pack_1',
      title: 'Concrete Jungle - Supporter Pack',
      price: 25.00,
      currency: 'USD',
      description: 'The ultimate collection for supporters. Get the official release, exclusive merchandise, and a host of unreleased content.',
      items: [
        { name: 'Official "Concrete Jungle" Release', icon: 'music-note' },
        { name: 'Exclusive T-Shirt Merchandise', icon: 'tshirt' },
        { name: 'Unreleased VIP & Bootlegs', icon: 'crown' },
        { name: 'SoundWave Masterclass Access', icon: 'camera' },
        { name: 'Public Playlist Curation', icon: 'playlist' },
      ]
    }
  ],
  'user_2': [],
  'user_3': [],
};


const sampleChatMessages: string[] = [
  "This new 'Concrete Jungle' track is fire! 🔥",
  "Anyone got tips for sidechaining reverb?",
  "Just dropped a new liquid funk tune, check it out on my profile!",
  "What's your favorite synth for pads?",
  "The bassline on 'Deepwater Horizon' is so clean.",
  "Looking for collaborators for a jungle project.",
  "That amen break is classic.",
  "Lioness Vibe's new track is a banger.",
  "Struggling with writer's block today.",
  "Anyone else using Ableton Live?",
  "The kicks in 'Babylon Fall' are hitting hard.",
  "How do you process your drums for that punchy sound?",
];

const globalEvents: GlobalEvent[] = [
    {
        id: 'ge_1',
        type: GlobalEventType.NEW_TRACK,
        title: 'New Track: "Amazon Flow"',
        description: 'A liquid funk anthem just dropped!',
        authorName: 'Sub-Tropical',
        transform: `rotateY(250deg) rotateX(30deg) translateZ(100px)`,
        animationDelay: '0s',
        locationName: 'London, UK',
        country: 'United Kingdom',
        groups: ['@Genre:LiquidFunk', '@Artist:Sub-Tropical', '@ReleasedMusic'],
        influence: 8,
        comments: [mockComments[0]]
    },
    {
        id: 'ge_2',
        type: GlobalEventType.IRL_EVENT,
        title: 'Live Show: Berlin',
        description: 'Catch Re-Flex live at Berghain next month.',
        authorName: 'Re-Flex',
        transform: `rotateY(350deg) rotateX(45deg) translateZ(100px)`,
        animationDelay: '0.4s',
        locationName: 'Berlin, Germany',
        country: 'Germany',
        groups: ['@Events:LiveSet', '@Artist:Re-Flex', '@TicketSales'],
        influence: 9,
        comments: []
    },
    {
        id: 'ge_3',
        type: GlobalEventType.NEW_PHOTO,
        title: 'New Studio Pic',
        description: 'Lioness Vibe shared a photo of her new studio setup.',
        authorName: 'Lioness Vibe',
        transform: `rotateY(220deg) rotateX(-15deg) translateZ(100px)`,
        animationDelay: '0.2s',
        locationName: 'Kingston, Jamaica',
        country: 'Jamaica',
        groups: ['@Artist:Lioness Vibe', '@SocialMediaHub'],
        influence: 6,
        comments: [mockComments[1]]
    },
     {
        id: 'ge_4',
        type: GlobalEventType.NEW_TRACK,
        title: 'New Track: "Kingston Skank"',
        description: 'High-energy jungle rhythms from Jamaica.',
        authorName: 'Lioness Vibe',
        transform: `rotateY(10deg) rotateX(10deg) translateZ(100px)`,
        animationDelay: '0.6s',
        locationName: 'Kingston, Jamaica',
        country: 'Jamaica',
        groups: ['@Genre:Jungle', '@Artist:Lioness Vibe', '@ReleasedMusic'],
        influence: 7,
        comments: []
    },
    {
        id: 'ge_5',
        type: GlobalEventType.NEW_PHOTO,
        title: 'Tokyo Street Art',
        description: 'Inspiration hunting in Shibuya.',
        authorName: 'Sub-Tropical',
        transform: `rotateY(80deg) rotateX(35deg) translateZ(100px)`,
        animationDelay: '0.8s',
        locationName: 'Tokyo, Japan',
        country: 'Japan',
        groups: ['@Mood:Inspiration', '@Artist:Sub-Tropical', '@SocialMediaHub'],
        influence: 5,
        comments: []
    },
];

const radioStations: RadioStation[] = [
    {
        id: 'station_1',
        name: 'Jungle Pressure Radio',
        description: 'The heaviest breaks and the deepest basslines. Strictly for the heads.',
        tags: ['Jungle', 'Bootleg', 'Dubwise'],
        imageUrl: 'https://picsum.photos/id/10/600/600',
    },
    {
        id: 'station_2',
        name: 'Liquid Funk Flow',
        description: 'Smooth, soulful, and atmospheric drum & bass for the late night drive.',
        tags: ['Liquid', 'Liquid Funk', 'Atmospheric'],
        imageUrl: 'https://picsum.photos/id/22/600/600',
    },
    {
        id: 'station_3',
        name: 'Sub-Tropical FM',
        description: 'A curated selection of tracks from the artist Sub-Tropical.',
        tags: [],
        artistId: 'user_1',
        imageUrl: 'https://picsum.photos/id/1015/600/600',
    },
];

const liveRooms: LiveRoom[] = [
    {
        id: 'room_global',
        name: 'SoundWave Global Room',
        host: { id: 'dj_gemini', name: 'DJ Gemini', avatarUrl: `https://i.pravatar.cc/150?u=dj_gemini`, bio:'' },
        viewers: 142,
        isLive: true,
    },
    {
        id: 'room_2',
        name: 'Dubplate Feedback Session',
        host: users[1], // Re-Flex
        viewers: 38,
        isLive: true,
    },
    {
        id: 'room_3',
        name: 'Reggae Roots & Culture',
        host: users[2], // Lioness Vibe
        viewers: 76,
        isLive: true,
    }
];

const communityPlaylists: CommunityPlaylist[] = [
  {
    id: 'cp_1',
    title: 'Late Night Rollers',
    curator: users[1], // Re-Flex
    tracks: [tracks[1], tracks[3], tracks[0], tracks[4]], // track_2, track_4, track_1, track_5
    comments: [mockComments[0]]
  },
  {
    id: 'cp_2',
    title: 'Jungle Massive Selection',
    curator: users[2], // Lioness Vibe
    tracks: [tracks[2], tracks[4], tracks[0]], // track_3, track_5, track_1
    comments: [mockComments[1]]
  },
  {
    id: 'cp_3',
    title: 'Atmospheric Vibes',
    curator: users[0], // Sub-Tropical
    tracks: [tracks[0], tracks[3]], // track_1, track_4
    comments: []
  },
  {
    id: 'cp_4',
    title: 'My D&B Favorites',
    curator: users[0], // Sub-Tropical
    tracks: [tracks[0], tracks[1], tracks[4]],
  }
];

const tutorials: Tutorial[] = [
  {
    id: 'tut_1',
    title: 'Anatomy of a Jungle Breakbeat',
    instructor: users[0], // Sub-Tropical
    thumbnailUrl: 'https://picsum.photos/id/501/400/225',
    duration: '12:45',
    difficulty: 'Intermediate',
    tags: ['Breakbeats', 'Jungle', 'Drums'],
    comments: [mockComments[0]]
  },
  {
    id: 'tut_2',
    title: 'Crafting Deep Sub-Bass',
    instructor: users[1], // Re-Flex
    thumbnailUrl: 'https://picsum.photos/id/502/400/225',
    duration: '08:15',
    difficulty: 'Beginner',
    tags: ['Bass', 'Sound Design', 'Mixing'],
    comments: [mockComments[1]]
  },
  {
    id: 'tut_3',
    title: 'Dub Siren & FX Techniques',
    instructor: users[2], // Lioness Vibe
    thumbnailUrl: 'https://picsum.photos/id/503/400/225',
    duration: '15:30',
    difficulty: 'Intermediate',
    tags: ['FX', 'Dub', 'Sound Design']
  },
  {
    id: 'tut_4',
    title: 'Arranging a Liquid Funk Track',
    instructor: users[0], // Sub-Tropical
    thumbnailUrl: 'https://picsum.photos/id/504/400/225',
    duration: '22:05',
    difficulty: 'Advanced',
    tags: ['Arrangement', 'Liquid Funk', 'Workflow'],
    comments: []
  },
];

const masterclasses: Masterclass[] = [
  {
    id: 'mc_1',
    title: 'The Art of the Rolling Bassline',
    instructor: users[1], // Re-Flex
    coverArtUrl: 'https://picsum.photos/id/601/600/400',
    description: 'A comprehensive 4-hour course on the theory, sound design, and mixing techniques behind hypnotic, rolling D&B basslines.',
    price: 79.99,
    currency: 'USD',
    durationHours: 4,
    comments: [mockComments[0], mockComments[1]]
  },
  {
    id: 'mc_2',
    title: 'Modern Jungle Production Workflow',
    instructor: users[0], // Sub-Tropical
    coverArtUrl: 'https://picsum.photos/id/602/600/400',
    description: 'From sampling and chopping breaks to modern processing and arrangement, this 6-hour masterclass covers everything you need to know to create authentic jungle tracks with a modern edge.',
    price: 99.99,
    currency: 'USD',
    durationHours: 6,
    comments: []
  },
];

const samplePacks: SamplePack[] = [
  {
    id: 'sp_1',
    title: 'Sub-Tropical DnB Essentials',
    creator: users[0],
    coverArtUrl: 'https://picsum.photos/id/701/400/400',
    price: 29.99,
    currency: 'USD',
    tags: ['D&B', 'Jungle', 'Atmospheric'],
    contains: ['25 Bass Loops', '50 Drum Breaks', '30 Pad Samples'],
    comments: [mockComments[0]]
  },
  {
    id: 'sp_2',
    title: 'Re-Flex Techstep Drums',
    creator: users[1],
    coverArtUrl: 'https://picsum.photos/id/702/400/400',
    price: 19.99,
    currency: 'USD',
    tags: ['Techstep', 'Drums', 'Minimal'],
    contains: ['100 Drum One-Shots', '20 Percussion Loops'],
    comments: [mockComments[1]]
  },
  {
    id: 'sp_3',
    title: 'Lioness Vibe Dub Vocals Vol. 1',
    creator: users[2],
    coverArtUrl: 'https://picsum.photos/id/703/400/400',
    price: 0,
    currency: 'USD',
    tags: ['Vocals', 'Dub', 'Reggae'],
    contains: ['15 Vocal Phrases', '10 FX One-Shots'],
    comments: []
  },
];

// Helper to delay response
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Data Fetching Functions ---

export const getUsers = async (): Promise<User[]> => { await sleep(50); return users; };
export const getUserById = async (id: string): Promise<User | undefined> => { await sleep(50); return users.find(u => u.id === id); };

export const getTracks = async (): Promise<Track[]> => { await sleep(50); return tracks; };
export const getTrackById = async (id: string): Promise<Track | undefined> => { await sleep(50); return tracks.find(t => t.id === id); };
export const getTracksByArtist = async (artistId: string): Promise<Track[]> => { await sleep(50); return tracks.filter(t => t.artistId === artistId); };
export const getTracksByLabelId = async (labelId: string): Promise<Track[]> => { await sleep(50); return tracks.filter(t => t.labelId === labelId); };

export const getPosts = async (): Promise<Post[]> => { await sleep(50); return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); };
export const getPostsByLabelId = async (labelId: string): Promise<Post[]> => { await sleep(50); return posts.filter(p => p.authorId === labelId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); };

export const getSampleChatMessages = (): string[] => sampleChatMessages;
export const getGlobalEvents = async (): Promise<GlobalEvent[]> => { await sleep(100); return globalEvents; };
export const getExternalReleasesByArtist = async (artistId: string): Promise<ExternalRelease[]> => { await sleep(50); return externalReleases[artistId] || []; };
export const getPremiumPacksByArtist = async (artistId: string): Promise<PremiumPack[]> => { await sleep(50); return premiumPacks[artistId] || []; };
export const getRadioStations = async (): Promise<RadioStation[]> => { await sleep(50); return radioStations; };
export const getLiveRooms = async (): Promise<LiveRoom[]> => { await sleep(50); return liveRooms; };
export const getCommunityPlaylists = async (): Promise<CommunityPlaylist[]> => { await sleep(50); return communityPlaylists; };
export const getTutorials = async (): Promise<Tutorial[]> => { await sleep(50); return tutorials; };
export const getMasterclasses = async (): Promise<Masterclass[]> => { await sleep(50); return masterclasses; };
export const getSamplePacks = async (): Promise<SamplePack[]> => { await sleep(50); return samplePacks; };
export const getLabels = async (): Promise<Label[]> => { await sleep(50); return labels; };
export const getLabelById = async (id: string): Promise<Label | undefined> => { await sleep(50); return labels.find(l => l.id === id); };
export const getArtistsByLabelId = async (labelId: string): Promise<User[]> => {
    await sleep(50);
    const label = labels.find(l => l.id === labelId);
    if (!label) return [];
    return users.filter(u => label.artistIds.includes(u.id));
};
export const getEventsByLabelId = async (labelId: string): Promise<LabelEvent[]> => { await sleep(50); return labelEvents[labelId] || []; };
export const getConversations = async (userId: string): Promise<Conversation[]> => { await sleep(50); return conversations; };

// --- Data Mutation Functions ---

type NewPostData = {
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    authorAvatarUrl: string;
    audience?: PostAudience;
}

export const addPost = async (postData: NewPostData): Promise<Post> => {
  await sleep(300); // Simulate network delay
  const newPost: Post = {
    id: `post_${Date.now()}`,
    ...postData,
    createdAt: new Date().toISOString(),
    likes: 0,
    replyCount: 0,
    replies: []
  };
  posts.unshift(newPost); // Add to the beginning of the array
  return newPost;
};

// Generic comment creation helper
const createComment = (commentData: Omit<Comment, 'id' | 'createdAt'>): Comment => {
    return {
        id: `c_${Date.now()}_${Math.random()}`,
        createdAt: new Date().toISOString(),
        ...commentData
    };
};

export const addCommentToTrack = async (trackId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const track = tracks.find(t => t.id === trackId);
    if (!track) throw new Error("Track not found");
    const newComment = createComment(commentData);
    if (!track.comments) track.comments = [];
    track.comments.push(newComment);
    return newComment;
};

export const addReplyToPost = async (postId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error("Post not found");
    const newReply = createComment(commentData);
    if (!post.replies) post.replies = [];
    post.replies.push(newReply);
    post.replyCount = post.replies.length;
    return newReply;
};

export const addCommentToMasterclass = async (masterclassId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const masterclass = masterclasses.find(mc => mc.id === masterclassId);
    if (!masterclass) throw new Error("Masterclass not found");
    const newComment = createComment(commentData);
    if (!masterclass.comments) masterclass.comments = [];
    masterclass.comments.push(newComment);
    return newComment;
};

export const addCommentToSamplePack = async (packId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const pack = samplePacks.find(p => p.id === packId);
    if (!pack) throw new Error("Sample pack not found");
    const newComment = createComment(commentData);
    if (!pack.comments) pack.comments = [];
    pack.comments.push(newComment);
    return newComment;
};

export const addCommentToTutorial = async (tutorialId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const tutorial = tutorials.find(t => t.id === tutorialId);
    if (!tutorial) throw new Error("Tutorial not found");
    const newComment = createComment(commentData);
    if (!tutorial.comments) tutorial.comments = [];
    tutorial.comments.push(newComment);
    return newComment;
};

export const addCommentToGlobalEvent = async (eventId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const event = globalEvents.find(e => e.id === eventId);
    if (!event) throw new Error("Global event not found");
    const newComment = createComment(commentData);
    if (!event.comments) event.comments = [];
    event.comments.push(newComment);
    return newComment;
};

export const addCommentToPlaylist = async (playlistId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const playlist = communityPlaylists.find(p => p.id === playlistId);
    if (!playlist) throw new Error("Playlist not found");
    const newComment = createComment(commentData);
    if (!playlist.comments) playlist.comments = [];
    playlist.comments.push(newComment);
    return newComment;
};

export const addCommentToLabel = async (labelId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const label = labels.find(l => l.id === labelId);
    if (!label) throw new Error("Label not found");
    const newComment = createComment(commentData);
    if (!label.comments) label.comments = [];
    label.comments.push(newComment);
    return newComment;
};

export const addCommentToOpportunity = async (labelId: string, opportunityId: string, commentData: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> => {
    await sleep(200);
    const labelOpps = opportunities[labelId];
    if (!labelOpps) throw new Error("Label opportunities not found");
    const opportunity = labelOpps.find(o => o.id === opportunityId);
    if (!opportunity) throw new Error("Opportunity not found");
    const newComment = createComment(commentData);
    if (!opportunity.comments) opportunity.comments = [];
    opportunity.comments.push(newComment);
    return newComment;
};