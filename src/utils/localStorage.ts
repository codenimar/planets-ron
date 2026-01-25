// Local Storage Service for RoninAds
// Provides a complete data persistence layer without needing a backend

// Data Models
export interface Member {
  id: string;
  wallet_address: string;
  wallet_type: string;
  points: number;
  created_at: string;
  last_login: string;
  is_active: boolean;
  is_admin?: boolean;
}

export interface ClickPass {
  id: string;
  member_id: string;
  pass_type: 'Basic' | 'Silver' | 'Golden';
  additional_points: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PublisherPass {
  id: string;
  member_id: string;
  pass_type: 'Basic' | 'Silver' | 'Gold';
  duration_days: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface NFTCollection {
  id: string;
  collection_name: string;
  collection_address: string;
  points_per_nft: number;
  max_nfts_counted: number;
  is_active: boolean;
  created_at: string;
}

export interface MemberNFT {
  id: string;
  member_id: string;
  collection_id: string;
  nft_count: number;
  last_verified: string;
}

export interface Post {
  id: string;
  publisher_id: string;
  title: string;
  content: string;
  post_type: 'ad' | 'post' | 'announcement';
  status: 'pending' | 'active' | 'inactive' | 'expired';
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  approved_by: string | null;
  approved_at: string | null;
}

export interface PostView {
  id: string;
  post_id: string;
  member_id: string;
  viewed_at: string;
  view_duration: number;
  points_earned: number;
}

export interface Reward {
  id: string;
  reward_type: 'nft' | 'token';
  name: string;
  description: string;
  points_cost: number;
  image_url: string;
  quantity_available: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardClaim {
  id: string;
  member_id: string;
  reward_id: string;
  points_spent: number;
  status: 'pending' | 'sent' | 'cancelled';
  claimed_at: string;
  processed_at: string | null;
}

export interface PointsHistory {
  id: string;
  member_id: string;
  points_change: number;
  reason: string;
  related_id: string | null;
  created_at: string;
}

export interface Session {
  id: string;
  member_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface AppConfig {
  nft_collections: NFTCollection[];
  rewards: Reward[];
  admin_wallets: string[];
  app_settings: {
    base_points_per_view: number;
    view_duration_required: number;
    cooldown_hours: number;
    max_posts_per_publisher: number;
  };
}

// Storage Keys
const STORAGE_KEYS = {
  MEMBERS: 'roninads_members',
  CLICK_PASSES: 'roninads_click_passes',
  PUBLISHER_PASSES: 'roninads_publisher_passes',
  NFT_COLLECTIONS: 'roninads_nft_collections',
  MEMBER_NFTS: 'roninads_member_nfts',
  POSTS: 'roninads_posts',
  POST_VIEWS: 'roninads_post_views',
  REWARDS: 'roninads_rewards',
  REWARD_CLAIMS: 'roninads_reward_claims',
  POINTS_HISTORY: 'roninads_points_history',
  SESSIONS: 'roninads_sessions',
  CONFIG: 'roninads_config',
};

// Utility function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage (${key}):`, error);
  }
}

// Initialize default configuration
function initializeDefaultConfig(): AppConfig {
  return {
    nft_collections: [
      {
        id: generateId(),
        collection_name: 'Axie Infinity',
        collection_address: '0x32950db2a7164ae833121501c797d79e7b79d74c',
        points_per_nft: 1,
        max_nfts_counted: 3,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        collection_name: 'Ronin Name Service',
        collection_address: '0xfeed00aa7e8a9a5da4de8e0617f94e744c1b0000',
        points_per_nft: 1,
        max_nfts_counted: 3,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    rewards: [
      {
        id: generateId(),
        reward_type: 'nft',
        name: 'Premium NFT Badge',
        description: 'Exclusive RoninAds NFT Badge',
        points_cost: 1000,
        image_url: '/logo192.png',
        quantity_available: 100,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: generateId(),
        reward_type: 'token',
        name: '10 RON Tokens',
        description: 'Claim 10 RON tokens',
        points_cost: 500,
        image_url: '/logo192.png',
        quantity_available: 50,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ],
    admin_wallets: [],
    app_settings: {
      base_points_per_view: 1,
      view_duration_required: 10,
      cooldown_hours: 24,
      max_posts_per_publisher: 3,
    },
  };
}

// Initialize storage if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
    const defaultConfig = initializeDefaultConfig();
    saveToStorage(STORAGE_KEYS.CONFIG, defaultConfig);
  }
  
  // Initialize empty arrays for other data
  if (!localStorage.getItem(STORAGE_KEYS.MEMBERS)) {
    saveToStorage(STORAGE_KEYS.MEMBERS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
    saveToStorage(STORAGE_KEYS.POSTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POST_VIEWS)) {
    saveToStorage(STORAGE_KEYS.POST_VIEWS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REWARD_CLAIMS)) {
    saveToStorage(STORAGE_KEYS.REWARD_CLAIMS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.POINTS_HISTORY)) {
    saveToStorage(STORAGE_KEYS.POINTS_HISTORY, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
    saveToStorage(STORAGE_KEYS.SESSIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLICK_PASSES)) {
    saveToStorage(STORAGE_KEYS.CLICK_PASSES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PUBLISHER_PASSES)) {
    saveToStorage(STORAGE_KEYS.PUBLISHER_PASSES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBER_NFTS)) {
    saveToStorage(STORAGE_KEYS.MEMBER_NFTS, []);
  }
}

// Member operations
export const MemberService = {
  getAll(): Member[] {
    return getFromStorage<Member[]>(STORAGE_KEYS.MEMBERS, []);
  },

  getById(id: string): Member | null {
    const members = this.getAll();
    return members.find(m => m.id === id) || null;
  },

  getByWalletAddress(address: string): Member | null {
    const members = this.getAll();
    return members.find(m => m.wallet_address.toLowerCase() === address.toLowerCase()) || null;
  },

  create(wallet_address: string, wallet_type: string): Member {
    const members = this.getAll();
    const config = getFromStorage<AppConfig>(STORAGE_KEYS.CONFIG, initializeDefaultConfig());
    
    const newMember: Member = {
      id: generateId(),
      wallet_address,
      wallet_type,
      points: 0,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true,
      is_admin: config.admin_wallets.includes(wallet_address.toLowerCase()),
    };

    members.push(newMember);
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return newMember;
  },

  update(id: string, updates: Partial<Member>): Member | null {
    const members = this.getAll();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return members[index];
  },

  addPoints(id: string, points: number, reason: string, relatedId: string | null = null): void {
    const member = this.getById(id);
    if (!member) return;

    member.points += points;
    this.update(id, { points: member.points });

    // Record in points history
    const history = getFromStorage<PointsHistory[]>(STORAGE_KEYS.POINTS_HISTORY, []);
    history.push({
      id: generateId(),
      member_id: id,
      points_change: points,
      reason,
      related_id: relatedId,
      created_at: new Date().toISOString(),
    });
    saveToStorage(STORAGE_KEYS.POINTS_HISTORY, history);
  },
};

// Session operations
export const SessionService = {
  getAll(): Session[] {
    return getFromStorage<Session[]>(STORAGE_KEYS.SESSIONS, []);
  },

  create(member_id: string): Session {
    const sessions = this.getAll();
    const token = generateId() + generateId();
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const newSession: Session = {
      id: generateId(),
      member_id,
      token,
      expires_at,
      created_at: new Date().toISOString(),
    };

    sessions.push(newSession);
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);
    return newSession;
  },

  getByToken(token: string): Session | null {
    const sessions = this.getAll();
    const session = sessions.find(s => s.token === token);
    
    if (!session) return null;
    
    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      this.delete(session.id);
      return null;
    }

    return session;
  },

  delete(id: string): void {
    const sessions = this.getAll();
    const filtered = sessions.filter(s => s.id !== id);
    saveToStorage(STORAGE_KEYS.SESSIONS, filtered);
  },

  deleteByToken(token: string): void {
    const sessions = this.getAll();
    const filtered = sessions.filter(s => s.token !== token);
    saveToStorage(STORAGE_KEYS.SESSIONS, filtered);
  },
};

// Post operations
export const PostService = {
  getAll(): Post[] {
    return getFromStorage<Post[]>(STORAGE_KEYS.POSTS, []);
  },

  getActive(): Post[] {
    const posts = this.getAll();
    const now = new Date();
    return posts.filter(p => 
      p.status === 'active' && 
      (p.expires_at === null || new Date(p.expires_at) > now)
    );
  },

  getByPublisher(publisherId: string): Post[] {
    const posts = this.getAll();
    return posts.filter(p => p.publisher_id === publisherId);
  },

  getById(id: string): Post | null {
    const posts = this.getAll();
    return posts.find(p => p.id === id) || null;
  },

  create(publisherId: string, title: string, content: string, postType: 'ad' | 'post' | 'announcement', durationDays: number): Post {
    const posts = this.getAll();
    const expires_at = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const newPost: Post = {
      id: generateId(),
      publisher_id: publisherId,
      title,
      content,
      post_type: postType,
      status: 'pending',
      expires_at,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
    };

    posts.push(newPost);
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    return newPost;
  },

  update(id: string, updates: Partial<Post>): Post | null {
    const posts = this.getAll();
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    posts[index] = { ...posts[index], ...updates, updated_at: new Date().toISOString() };
    saveToStorage(STORAGE_KEYS.POSTS, posts);
    return posts[index];
  },

  approve(id: string, adminId: string): Post | null {
    return this.update(id, {
      status: 'active',
      approved_by: adminId,
      approved_at: new Date().toISOString(),
    });
  },

  checkExpired(): void {
    const posts = this.getAll();
    const now = new Date();
    
    posts.forEach(post => {
      if (post.expires_at && new Date(post.expires_at) < now && post.status === 'active') {
        post.status = 'expired';
      }
    });
    
    saveToStorage(STORAGE_KEYS.POSTS, posts);
  },
};

// Post View operations
export const PostViewService = {
  getAll(): PostView[] {
    return getFromStorage<PostView[]>(STORAGE_KEYS.POST_VIEWS, []);
  },

  hasViewedRecently(postId: string, memberId: string, cooldownHours: number): boolean {
    const views = this.getAll();
    const cooldownMs = cooldownHours * 60 * 60 * 1000;
    const cutoffTime = new Date(Date.now() - cooldownMs);

    return views.some(v => 
      v.post_id === postId && 
      v.member_id === memberId && 
      new Date(v.viewed_at) > cutoffTime
    );
  },

  create(postId: string, memberId: string, viewDuration: number, pointsEarned: number): PostView {
    const views = this.getAll();

    const newView: PostView = {
      id: generateId(),
      post_id: postId,
      member_id: memberId,
      viewed_at: new Date().toISOString(),
      view_duration: viewDuration,
      points_earned: pointsEarned,
    };

    views.push(newView);
    saveToStorage(STORAGE_KEYS.POST_VIEWS, views);
    return newView;
  },

  getByMember(memberId: string): PostView[] {
    const views = this.getAll();
    return views.filter(v => v.member_id === memberId);
  },
};

// Reward operations
export const RewardService = {
  getAll(): Reward[] {
    const config = getFromStorage<AppConfig>(STORAGE_KEYS.CONFIG, initializeDefaultConfig());
    return config.rewards.filter(r => r.is_active);
  },

  getById(id: string): Reward | null {
    const rewards = this.getAll();
    return rewards.find(r => r.id === id) || null;
  },
};

// Reward Claim operations
export const RewardClaimService = {
  getAll(): RewardClaim[] {
    return getFromStorage<RewardClaim[]>(STORAGE_KEYS.REWARD_CLAIMS, []);
  },

  getByMember(memberId: string): RewardClaim[] {
    const claims = this.getAll();
    return claims.filter(c => c.member_id === memberId);
  },

  create(memberId: string, rewardId: string, pointsCost: number): RewardClaim {
    const claims = this.getAll();

    const newClaim: RewardClaim = {
      id: generateId(),
      member_id: memberId,
      reward_id: rewardId,
      points_spent: pointsCost,
      status: 'pending',
      claimed_at: new Date().toISOString(),
      processed_at: null,
    };

    claims.push(newClaim);
    saveToStorage(STORAGE_KEYS.REWARD_CLAIMS, claims);

    // Deduct points
    MemberService.addPoints(memberId, -pointsCost, `Claimed reward`, rewardId);

    return newClaim;
  },

  updateStatus(id: string, status: 'sent' | 'cancelled'): RewardClaim | null {
    const claims = this.getAll();
    const index = claims.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    claims[index].status = status;
    claims[index].processed_at = new Date().toISOString();
    
    saveToStorage(STORAGE_KEYS.REWARD_CLAIMS, claims);
    return claims[index];
  },
};

// Pass operations
export const PassService = {
  getClickPass(memberId: string): ClickPass | null {
    const passes = getFromStorage<ClickPass[]>(STORAGE_KEYS.CLICK_PASSES, []);
    const activePasses = passes.filter(p => 
      p.member_id === memberId && 
      p.is_active &&
      (p.expires_at === null || new Date(p.expires_at) > new Date())
    );
    return activePasses[0] || null;
  },

  getPublisherPass(memberId: string): PublisherPass | null {
    const passes = getFromStorage<PublisherPass[]>(STORAGE_KEYS.PUBLISHER_PASSES, []);
    const activePasses = passes.filter(p => 
      p.member_id === memberId && 
      p.is_active &&
      (p.expires_at === null || new Date(p.expires_at) > new Date())
    );
    return activePasses[0] || null;
  },

  addClickPass(memberId: string, passType: 'Basic' | 'Silver' | 'Golden'): ClickPass {
    const passes = getFromStorage<ClickPass[]>(STORAGE_KEYS.CLICK_PASSES, []);
    const additionalPoints = passType === 'Basic' ? 10 : passType === 'Silver' ? 20 : 30;

    const newPass: ClickPass = {
      id: generateId(),
      member_id: memberId,
      pass_type: passType,
      additional_points: additionalPoints,
      expires_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    passes.push(newPass);
    saveToStorage(STORAGE_KEYS.CLICK_PASSES, passes);
    return newPass;
  },

  addPublisherPass(memberId: string, passType: 'Basic' | 'Silver' | 'Gold'): PublisherPass {
    const passes = getFromStorage<PublisherPass[]>(STORAGE_KEYS.PUBLISHER_PASSES, []);
    const durationDays = passType === 'Basic' ? 3 : passType === 'Silver' ? 10 : 30;

    const newPass: PublisherPass = {
      id: generateId(),
      member_id: memberId,
      pass_type: passType,
      duration_days: durationDays,
      expires_at: null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    passes.push(newPass);
    saveToStorage(STORAGE_KEYS.PUBLISHER_PASSES, passes);
    return newPass;
  },
};

export const ConfigService = {
  get(): AppConfig {
    return getFromStorage<AppConfig>(STORAGE_KEYS.CONFIG, initializeDefaultConfig());
  },

  update(config: AppConfig): void {
    saveToStorage(STORAGE_KEYS.CONFIG, config);
  },

  addAdminWallet(walletAddress: string): void {
    const config = this.get();
    if (!config.admin_wallets.includes(walletAddress.toLowerCase())) {
      config.admin_wallets.push(walletAddress.toLowerCase());
      this.update(config);
    }
  },

  removeAdminWallet(walletAddress: string): void {
    const config = this.get();
    config.admin_wallets = config.admin_wallets.filter(
      w => w.toLowerCase() !== walletAddress.toLowerCase()
    );
    this.update(config);
  },

  isAdmin(walletAddress: string): boolean {
    const config = this.get();
    return config.admin_wallets.includes(walletAddress.toLowerCase());
  },

  exportData(): string {
    const data = {
      members: MemberService.getAll(),
      posts: PostService.getAll(),
      postViews: PostViewService.getAll(),
      rewardClaims: RewardClaimService.getAll(),
      clickPasses: getFromStorage<ClickPass[]>(STORAGE_KEYS.CLICK_PASSES, []),
      publisherPasses: getFromStorage<PublisherPass[]>(STORAGE_KEYS.PUBLISHER_PASSES, []),
      pointsHistory: getFromStorage<PointsHistory[]>(STORAGE_KEYS.POINTS_HISTORY, []),
      config: this.get(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.members) saveToStorage(STORAGE_KEYS.MEMBERS, data.members);
      if (data.posts) saveToStorage(STORAGE_KEYS.POSTS, data.posts);
      if (data.postViews) saveToStorage(STORAGE_KEYS.POST_VIEWS, data.postViews);
      if (data.rewardClaims) saveToStorage(STORAGE_KEYS.REWARD_CLAIMS, data.rewardClaims);
      if (data.clickPasses) saveToStorage(STORAGE_KEYS.CLICK_PASSES, data.clickPasses);
      if (data.publisherPasses) saveToStorage(STORAGE_KEYS.PUBLISHER_PASSES, data.publisherPasses);
      if (data.pointsHistory) saveToStorage(STORAGE_KEYS.POINTS_HISTORY, data.pointsHistory);
      if (data.config) saveToStorage(STORAGE_KEYS.CONFIG, data.config);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    initializeStorage();
  },
};
