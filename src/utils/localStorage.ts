// Local Storage Service for RoninAds
// Provides a complete data persistence layer without needing a backend

// Data Models
export interface Member {
  id: string;
  wallet_address: string;
  wallet_type: string;
  x_handle?: string;  // X.com handle
  points: number;
  created_at: string;
  last_login: string;
  is_active: boolean;
  is_admin?: boolean;
  referral_code?: string;
  referred_by?: string | null;
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

export interface Message {
  id: string;
  from_member_id: string;
  to_member_id: string | null; // null means broadcast to all
  subject: string;
  content: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface RewardDistribution {
  id: string;
  reward_id: string;
  member_id: string;
  distributed_at: string;
  notes: string;
}

// New models for X.com post interaction system
export interface XPost {
  id: string;
  post_url: string;
  image_url: string;  // Screenshot or uploaded image
  created_by: string;  // admin who created it
  created_at: string;
  is_active: boolean;
}

export interface XPostAction {
  id: string;
  post_id: string;
  member_id: string;
  action_type: 'follow' | 'like' | 'retweet';
  verified: boolean;
  verified_at: string | null;
  points_earned: number;
  created_at: string;
}

// Featured assets for bonus points
export interface FeaturedAsset {
  id: string;
  asset_type: 'nft_collection' | 'token';
  name: string;
  contract_address: string;
  required_amount: number;  // 1 for NFT, 100000 for token
  bonus_multiplier: number;  // e.g., 2 for 2x points (1 extra point per action)
  is_active: boolean;
  created_at: string;
}

export interface MemberAssetVerification {
  id: string;
  member_id: string;
  asset_id: string;
  verified: boolean;
  last_checked: string;
  cooldown_until: string;  // 1 hour cooldown
}

// Weekly rewards system
export interface WeeklyReward {
  id: string;
  week_start: string;
  week_end: string;
  item_name: string;
  item_quantity: number;
  is_active: boolean;
  created_at: string;
}

export interface WeeklyWinner {
  id: string;
  weekly_reward_id: string;
  member_id: string;
  ronin_address: string;
  item_number: number;
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
  MESSAGES: 'roninads_messages',
  REWARD_DISTRIBUTIONS: 'roninads_reward_distributions',
  X_POSTS: 'roninads_x_posts',
  X_POST_ACTIONS: 'roninads_x_post_actions',
  FEATURED_ASSETS: 'roninads_featured_assets',
  MEMBER_ASSET_VERIFICATIONS: 'roninads_member_asset_verifications',
  WEEKLY_REWARDS: 'roninads_weekly_rewards',
  WEEKLY_WINNERS: 'roninads_weekly_winners',
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
    admin_wallets: ['0x0c778693bda15912cfb07f63e5ed92886ca94411'],  // ✅ CORRECT
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
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    saveToStorage(STORAGE_KEYS.MESSAGES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.REWARD_DISTRIBUTIONS)) {
    saveToStorage(STORAGE_KEYS.REWARD_DISTRIBUTIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.X_POSTS)) {
    saveToStorage(STORAGE_KEYS.X_POSTS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.X_POST_ACTIONS)) {
    saveToStorage(STORAGE_KEYS.X_POST_ACTIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.FEATURED_ASSETS)) {
    saveToStorage(STORAGE_KEYS.FEATURED_ASSETS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEMBER_ASSET_VERIFICATIONS)) {
    saveToStorage(STORAGE_KEYS.MEMBER_ASSET_VERIFICATIONS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WEEKLY_REWARDS)) {
    saveToStorage(STORAGE_KEYS.WEEKLY_REWARDS, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.WEEKLY_WINNERS)) {
    saveToStorage(STORAGE_KEYS.WEEKLY_WINNERS, []);
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

  create(wallet_address: string, wallet_type: string, referredByCode?: string): Member {
    const members = this.getAll();
    const config = getFromStorage<AppConfig>(STORAGE_KEYS.CONFIG, initializeDefaultConfig());
    
    // Generate unique referral code with collision detection
    let referral_code = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    const isReferralCodeTaken = (code: string) => members.some(m => m.referral_code === code);
    
    do {
      referral_code = generateId().substring(0, 8).toUpperCase();
      attempts++;
    } while (
      isReferralCodeTaken(referral_code) && 
      attempts < maxAttempts
    );
    
    // Find referrer if referral code provided
    let referred_by = null;
    if (referredByCode) {
      const referrer = members.find(m => m.referral_code === referredByCode);
      if (referrer) {
        referred_by = referrer.id;
      } else {
        console.warn(`Invalid referral code provided: ${referredByCode}`);
      }
    }
    
    const newMember: Member = {
      id: generateId(),
      wallet_address,
      wallet_type,
      points: 0,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      is_active: true,
      is_admin: config.admin_wallets.includes(wallet_address.toLowerCase()),
      referral_code,
      referred_by,
    };

    members.push(newMember);
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return newMember;
  },

  ensureReferralCode(id: string): Member | null {
    const members = this.getAll();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;

    if (members[index].referral_code) {
      return members[index];
    }

    let referral_code = '';
    let attempts = 0;
    const maxAttempts = 10;

    const isReferralCodeTaken = (code: string) => members.some(m => m.referral_code === code);

    do {
      referral_code = generateId().substring(0, 8).toUpperCase();
      attempts++;
    } while (
      isReferralCodeTaken(referral_code) &&
      attempts < maxAttempts
    );

    members[index] = { ...members[index], referral_code };
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return members[index];
  },

  update(id: string, updates: Partial<Member>): Member | null {
    const members = this.getAll();
    const index = members.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    members[index] = { ...members[index], ...updates };
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return members[index];
  },

  getReferrals(memberId: string): Member[] {
    const members = this.getAll();
    return members.filter(m => m.referred_by === memberId);
  },

  getByReferralCode(code: string): Member | null {
    const members = this.getAll();
    return members.find(m => m.referral_code === code) || null;
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

    // Give referrer 10 points if member was referred
    const member = MemberService.getById(memberId);
    if (member && member.referred_by) {
      MemberService.addPoints(member.referred_by, 10, `Referral ${member.wallet_address} claimed a prize`, memberId);
    }

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
      messages: MessageService.getAll(),
      rewardDistributions: RewardDistributionService.getAll(),
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
      if (data.messages) saveToStorage(STORAGE_KEYS.MESSAGES, data.messages);
      if (data.rewardDistributions) saveToStorage(STORAGE_KEYS.REWARD_DISTRIBUTIONS, data.rewardDistributions);
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

// Message operations
export const MessageService = {
  getAll(): Message[] {
    return getFromStorage<Message[]>(STORAGE_KEYS.MESSAGES, []);
  },

  getById(id: string): Message | null {
    const messages = this.getAll();
    return messages.find(m => m.id === id) || null;
  },

  getByRecipient(memberId: string): Message[] {
    const messages = this.getAll();
    return messages.filter(m => m.to_member_id === memberId || m.to_member_id === null);
  },

  getUnreadCount(memberId: string): number {
    const messages = this.getByRecipient(memberId);
    return messages.filter(m => !m.is_read).length;
  },

  create(fromMemberId: string, toMemberId: string | null, subject: string, content: string): Message {
    const messages = this.getAll();

    const newMessage: Message = {
      id: generateId(),
      from_member_id: fromMemberId,
      to_member_id: toMemberId,
      subject,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    };

    messages.push(newMessage);
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
    return newMessage;
  },

  markAsRead(id: string): Message | null {
    const messages = this.getAll();
    const index = messages.findIndex(m => m.id === id);
    
    if (index === -1) return null;

    messages[index].is_read = true;
    messages[index].read_at = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.MESSAGES, messages);
    return messages[index];
  },

  delete(id: string): void {
    const messages = this.getAll();
    const filtered = messages.filter(m => m.id !== id);
    saveToStorage(STORAGE_KEYS.MESSAGES, filtered);
  },
};

// Reward Distribution operations
export const RewardDistributionService = {
  getAll(): RewardDistribution[] {
    return getFromStorage<RewardDistribution[]>(STORAGE_KEYS.REWARD_DISTRIBUTIONS, []);
  },

  getRecent(limit: number = 10): RewardDistribution[] {
    const distributions = this.getAll();
    return distributions
      .sort((a, b) => new Date(b.distributed_at).getTime() - new Date(a.distributed_at).getTime())
      .slice(0, limit);
  },

  create(rewardId: string, memberId: string, notes: string): RewardDistribution {
    const distributions = this.getAll();

    const newDistribution: RewardDistribution = {
      id: generateId(),
      reward_id: rewardId,
      member_id: memberId,
      distributed_at: new Date().toISOString(),
      notes,
    };

    distributions.push(newDistribution);
    saveToStorage(STORAGE_KEYS.REWARD_DISTRIBUTIONS, distributions);
    return newDistribution;
  },
};

// X Post operations
export const XPostService = {
  getAll(): XPost[] {
    return getFromStorage<XPost[]>(STORAGE_KEYS.X_POSTS, []);
  },

  getActive(): XPost[] {
    return this.getAll().filter(p => p.is_active);
  },

  getById(id: string): XPost | null {
    const posts = this.getAll();
    return posts.find(p => p.id === id) || null;
  },

  create(postUrl: string, imageUrl: string, createdBy: string): XPost {
    const posts = this.getAll();

    const newPost: XPost = {
      id: generateId(),
      post_url: postUrl,
      image_url: imageUrl,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    posts.push(newPost);
    saveToStorage(STORAGE_KEYS.X_POSTS, posts);
    return newPost;
  },

  update(id: string, updates: Partial<XPost>): XPost | null {
    const posts = this.getAll();
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) return null;

    posts[index] = { ...posts[index], ...updates };
    saveToStorage(STORAGE_KEYS.X_POSTS, posts);
    return posts[index];
  },

  delete(id: string): void {
    const posts = this.getAll();
    const filtered = posts.filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.X_POSTS, filtered);
  },
};

// X Post Action operations
export const XPostActionService = {
  getAll(): XPostAction[] {
    return getFromStorage<XPostAction[]>(STORAGE_KEYS.X_POST_ACTIONS, []);
  },

  getByMember(memberId: string): XPostAction[] {
    return this.getAll().filter(a => a.member_id === memberId);
  },

  getByPost(postId: string): XPostAction[] {
    return this.getAll().filter(a => a.post_id === postId);
  },

  getByMemberAndPost(memberId: string, postId: string, actionType: 'follow' | 'like' | 'retweet'): XPostAction | null {
    const actions = this.getAll();
    return actions.find(a => 
      a.member_id === memberId && 
      a.post_id === postId && 
      a.action_type === actionType
    ) || null;
  },

  create(postId: string, memberId: string, actionType: 'follow' | 'like' | 'retweet', pointsEarned: number): XPostAction {
    const actions = this.getAll();

    const newAction: XPostAction = {
      id: generateId(),
      post_id: postId,
      member_id: memberId,
      action_type: actionType,
      verified: true,  // Auto-verified on creation
      verified_at: new Date().toISOString(),
      points_earned: pointsEarned,
      created_at: new Date().toISOString(),
    };

    actions.push(newAction);
    saveToStorage(STORAGE_KEYS.X_POST_ACTIONS, actions);
    return newAction;
  },
};

// Featured Asset operations
export const FeaturedAssetService = {
  getAll(): FeaturedAsset[] {
    return getFromStorage<FeaturedAsset[]>(STORAGE_KEYS.FEATURED_ASSETS, []);
  },

  getActive(): FeaturedAsset[] {
    return this.getAll().filter(a => a.is_active);
  },

  getById(id: string): FeaturedAsset | null {
    const assets = this.getAll();
    return assets.find(a => a.id === id) || null;
  },

  create(
    assetType: 'nft_collection' | 'token',
    name: string,
    contractAddress: string,
    requiredAmount: number,
    bonusMultiplier: number
  ): FeaturedAsset {
    const assets = this.getAll();

    const newAsset: FeaturedAsset = {
      id: generateId(),
      asset_type: assetType,
      name,
      contract_address: contractAddress.toLowerCase(),
      required_amount: requiredAmount,
      bonus_multiplier: bonusMultiplier,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    assets.push(newAsset);
    saveToStorage(STORAGE_KEYS.FEATURED_ASSETS, assets);
    return newAsset;
  },

  update(id: string, updates: Partial<FeaturedAsset>): FeaturedAsset | null {
    const assets = this.getAll();
    const index = assets.findIndex(a => a.id === id);
    
    if (index === -1) return null;

    assets[index] = { ...assets[index], ...updates };
    saveToStorage(STORAGE_KEYS.FEATURED_ASSETS, assets);
    return assets[index];
  },

  delete(id: string): void {
    const assets = this.getAll();
    const filtered = assets.filter(a => a.id !== id);
    saveToStorage(STORAGE_KEYS.FEATURED_ASSETS, filtered);
  },
};

// Member Asset Verification operations
export const MemberAssetVerificationService = {
  getAll(): MemberAssetVerification[] {
    return getFromStorage<MemberAssetVerification[]>(STORAGE_KEYS.MEMBER_ASSET_VERIFICATIONS, []);
  },

  getByMember(memberId: string): MemberAssetVerification[] {
    return this.getAll().filter(v => v.member_id === memberId);
  },

  getByMemberAndAsset(memberId: string, assetId: string): MemberAssetVerification | null {
    const verifications = this.getAll();
    return verifications.find(v => v.member_id === memberId && v.asset_id === assetId) || null;
  },

  canVerify(memberId: string, assetId: string): boolean {
    const verification = this.getByMemberAndAsset(memberId, assetId);
    if (!verification) return true;
    
    const now = new Date();
    const cooldownUntil = new Date(verification.cooldown_until);
    return now >= cooldownUntil;
  },

  create(memberId: string, assetId: string, verified: boolean): MemberAssetVerification {
    const verifications = this.getAll();
    const now = new Date();
    const cooldownUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour cooldown

    const newVerification: MemberAssetVerification = {
      id: generateId(),
      member_id: memberId,
      asset_id: assetId,
      verified,
      last_checked: now.toISOString(),
      cooldown_until: cooldownUntil.toISOString(),
    };

    verifications.push(newVerification);
    saveToStorage(STORAGE_KEYS.MEMBER_ASSET_VERIFICATIONS, verifications);
    return newVerification;
  },

  update(memberId: string, assetId: string, verified: boolean): MemberAssetVerification | null {
    const verifications = this.getAll();
    const index = verifications.findIndex(v => v.member_id === memberId && v.asset_id === assetId);
    
    if (index === -1) {
      // Create new verification if doesn't exist
      return this.create(memberId, assetId, verified);
    }

    const now = new Date();
    const cooldownUntil = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour cooldown

    verifications[index] = {
      ...verifications[index],
      verified,
      last_checked: now.toISOString(),
      cooldown_until: cooldownUntil.toISOString(),
    };
    
    saveToStorage(STORAGE_KEYS.MEMBER_ASSET_VERIFICATIONS, verifications);
    return verifications[index];
  },

  hasActiveVerification(memberId: string): boolean {
    const verifications = this.getByMember(memberId);
    return verifications.some(v => v.verified);
  },
};

// Weekly Reward operations
export const WeeklyRewardService = {
  getAll(): WeeklyReward[] {
    return getFromStorage<WeeklyReward[]>(STORAGE_KEYS.WEEKLY_REWARDS, []);
  },

  getActive(): WeeklyReward | null {
    const rewards = this.getAll().filter(r => r.is_active);
    return rewards.length > 0 ? rewards[0] : null;
  },

  getById(id: string): WeeklyReward | null {
    const rewards = this.getAll();
    return rewards.find(r => r.id === id) || null;
  },

  create(weekStart: string, weekEnd: string, itemName: string, itemQuantity: number): WeeklyReward {
    const rewards = this.getAll();

    // Deactivate all previous weekly rewards
    rewards.forEach(r => r.is_active = false);

    const newReward: WeeklyReward = {
      id: generateId(),
      week_start: weekStart,
      week_end: weekEnd,
      item_name: itemName,
      item_quantity: itemQuantity,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    rewards.push(newReward);
    saveToStorage(STORAGE_KEYS.WEEKLY_REWARDS, rewards);
    return newReward;
  },

  update(id: string, updates: Partial<WeeklyReward>): WeeklyReward | null {
    const rewards = this.getAll();
    const index = rewards.findIndex(r => r.id === id);
    
    if (index === -1) return null;

    rewards[index] = { ...rewards[index], ...updates };
    saveToStorage(STORAGE_KEYS.WEEKLY_REWARDS, rewards);
    return rewards[index];
  },

  deactivateAll(): void {
    const rewards = this.getAll();
    rewards.forEach(r => r.is_active = false);
    saveToStorage(STORAGE_KEYS.WEEKLY_REWARDS, rewards);
  },
};

// Weekly Winner operations
export const WeeklyWinnerService = {
  getAll(): WeeklyWinner[] {
    return getFromStorage<WeeklyWinner[]>(STORAGE_KEYS.WEEKLY_WINNERS, []);
  },

  getByWeeklyReward(weeklyRewardId: string): WeeklyWinner[] {
    return this.getAll().filter(w => w.weekly_reward_id === weeklyRewardId);
  },

  create(weeklyRewardId: string, memberId: string, roninAddress: string, itemNumber: number): WeeklyWinner {
    const winners = this.getAll();

    const newWinner: WeeklyWinner = {
      id: generateId(),
      weekly_reward_id: weeklyRewardId,
      member_id: memberId,
      ronin_address: roninAddress,
      item_number: itemNumber,
      created_at: new Date().toISOString(),
    };

    winners.push(newWinner);
    saveToStorage(STORAGE_KEYS.WEEKLY_WINNERS, winners);
    return newWinner;
  },

  generateWinnersList(weeklyRewardId: string): WeeklyWinner[] {
    const weekly_reward = WeeklyRewardService.getById(weeklyRewardId);
    if (!weekly_reward) return [];

    // Get all members sorted by points
    const members = MemberService.getAll()
      .filter(m => m.is_active)
      .sort((a, b) => b.points - a.points);

    // Create winners for top members up to item_quantity
    const winners: WeeklyWinner[] = [];
    const count = Math.min(members.length, weekly_reward.item_quantity);

    for (let i = 0; i < count; i++) {
      const member = members[i];
      const winner = this.create(
        weeklyRewardId,
        member.id,
        member.wallet_address,
        i + 1
      );
      winners.push(winner);
    }

    return winners;
  },

  clearByWeeklyReward(weeklyRewardId: string): void {
    const winners = this.getAll();
    const filtered = winners.filter(w => w.weekly_reward_id !== weeklyRewardId);
    saveToStorage(STORAGE_KEYS.WEEKLY_WINNERS, filtered);
  },
};