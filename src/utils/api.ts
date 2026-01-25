// API service using local storage instead of backend
import {
  MemberService,
  SessionService,
  PostService,
  PostViewService,
  RewardService,
  RewardClaimService,
  PassService,
  ConfigService,
  initializeStorage,
  Member,
  Post,
} from './localStorage';

// Re-export ConfigService for convenience
export { ConfigService };

// Initialize storage on module load
initializeStorage();

// Session token management
const SESSION_TOKEN_KEY = 'roninads_session_token';

function getSessionToken(): string | null {
  return localStorage.getItem(SESSION_TOKEN_KEY);
}

function setSessionToken(token: string): void {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
}

function clearSessionToken(): void {
  localStorage.removeItem(SESSION_TOKEN_KEY);
}

function getCurrentSession() {
  const token = getSessionToken();
  if (!token) return null;
  return SessionService.getByToken(token);
}

function getCurrentMember(): Member | null {
  const session = getCurrentSession();
  if (!session) return null;
  return MemberService.getById(session.member_id);
}

// Auth API
export const AuthAPI = {
  async login(address: string, walletType: string) {
    try {
      let member = MemberService.getByWalletAddress(address);
      
      if (!member) {
        member = MemberService.create(address, walletType);
      } else {
        MemberService.update(member.id, { last_login: new Date().toISOString() });
      }

      const session = SessionService.create(member.id);
      setSessionToken(session.token);

      return {
        success: true,
        member,
        token: session.token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  },

  async logout() {
    try {
      const token = getSessionToken();
      if (token) {
        SessionService.deleteByToken(token);
      }
      clearSessionToken();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  },

  async checkSession() {
    try {
      const member = getCurrentMember();
      return {
        authenticated: !!member,
        member,
      };
    } catch (error) {
      return {
        authenticated: false,
        member: null,
      };
    }
  },
};

// Member API
export const MemberAPI = {
  async getProfile() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');
    return { success: true, member };
  },

  async getStats() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const clickPass = PassService.getClickPass(member.id);
    const publisherPass = PassService.getPublisherPass(member.id);
    const views = PostViewService.getByMember(member.id);
    const claims = RewardClaimService.getByMember(member.id);

    return {
      success: true,
      stats: {
        total_points: member.points,
        total_views: views.length,
        total_claims: claims.length,
        click_pass: clickPass,
        publisher_pass: publisherPass,
      },
    };
  },

  async getPasses() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const clickPass = PassService.getClickPass(member.id);
    const publisherPass = PassService.getPublisherPass(member.id);

    return {
      success: true,
      click_pass: clickPass,
      publisher_pass: publisherPass,
    };
  },
};

// Post API
export const PostAPI = {
  async list() {
    const posts = PostService.getActive();
    return { success: true, posts };
  },

  async myPosts() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const posts = PostService.getByPublisher(member.id);
    return { success: true, posts };
  },

  async create(title: string, content: string, postType: 'ad' | 'post' | 'announcement') {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const publisherPass = PassService.getPublisherPass(member.id);
    if (!publisherPass) {
      throw new Error('Publisher Pass required to create posts');
    }

    const config = ConfigService.get();
    const existingPosts = PostService.getByPublisher(member.id).filter(
      p => p.status === 'active' || p.status === 'pending'
    );

    if (existingPosts.length >= config.app_settings.max_posts_per_publisher) {
      throw new Error(`Maximum ${config.app_settings.max_posts_per_publisher} active posts allowed`);
    }

    const post = PostService.create(
      member.id,
      title,
      content,
      postType,
      publisherPass.duration_days
    );

    // Auto-approve if user is admin
    if (member.is_admin) {
      PostService.approve(post.id, member.id);
    }

    return { success: true, post };
  },

  async update(postId: string, updates: { title?: string; content?: string; status?: 'pending' | 'active' | 'inactive' | 'expired' }) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const post = PostService.getById(postId);
    if (!post) throw new Error('Post not found');

    if (post.publisher_id !== member.id && !member.is_admin) {
      throw new Error('Not authorized to update this post');
    }

    // If editing content, require re-approval
    const finalUpdates: Partial<Post> = { ...updates };
    if (updates.title || updates.content) {
      finalUpdates.status = 'pending';
    }

    const updatedPost = PostService.update(postId, finalUpdates);
    
    // Auto-approve if user is admin
    if (member.is_admin && finalUpdates.status !== 'inactive') {
      PostService.approve(postId, member.id);
    }

    return { success: true, post: updatedPost };
  },

  async view(postId: string, duration: number) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const config = ConfigService.get();
    const post = PostService.getById(postId);
    if (!post || post.status !== 'active') {
      throw new Error('Post not available');
    }

    // Check cooldown
    if (PostViewService.hasViewedRecently(postId, member.id, config.app_settings.cooldown_hours)) {
      throw new Error('Already viewed this post recently. Please wait for cooldown period.');
    }

    // Check minimum duration
    if (duration < config.app_settings.view_duration_required) {
      throw new Error(`Must view for at least ${config.app_settings.view_duration_required} seconds`);
    }

    // Calculate points
    let points = config.app_settings.base_points_per_view;
    
    const clickPass = PassService.getClickPass(member.id);
    if (clickPass) {
      points += clickPass.additional_points;
    }

    // Record view
    PostViewService.create(postId, member.id, duration, points);
    
    // Add points to member
    MemberService.addPoints(member.id, points, `Viewed post: ${post.title}`, postId);

    return {
      success: true,
      points_earned: points,
      message: `Earned ${points} points!`,
    };
  },
};

// Reward API
export const RewardAPI = {
  async list() {
    const rewards = RewardService.getAll();
    return { success: true, rewards };
  },

  async claim(rewardId: string) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const reward = RewardService.getById(rewardId);
    if (!reward) throw new Error('Reward not found');

    if (member.points < reward.points_cost) {
      throw new Error('Insufficient points');
    }

    const claim = RewardClaimService.create(member.id, rewardId, reward.points_cost);

    return {
      success: true,
      claim,
      message: 'Reward claimed successfully! It will be processed soon.',
    };
  },

  async myClaims() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const claims = RewardClaimService.getByMember(member.id);
    const claimsWithRewards = claims.map(claim => ({
      ...claim,
      reward: RewardService.getById(claim.reward_id),
    }));

    return { success: true, claims: claimsWithRewards };
  },
};

// Admin API
export const AdminAPI = {
  async getPendingPosts() {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const allPosts = PostService.getAll();
    const pending = allPosts.filter(p => p.status === 'pending');

    return { success: true, posts: pending };
  },

  async approvePost(postId: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const post = PostService.approve(postId, member.id);
    return { success: true, post };
  },

  async rejectPost(postId: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const post = PostService.update(postId, { status: 'inactive' });
    return { success: true, post };
  },

  async getAllClaims() {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const claims = RewardClaimService.getAll();
    const claimsWithDetails = claims.map(claim => ({
      ...claim,
      reward: RewardService.getById(claim.reward_id),
      member: MemberService.getById(claim.member_id),
    }));

    return { success: true, claims: claimsWithDetails };
  },

  async updateClaimStatus(claimId: string, status: 'sent' | 'cancelled') {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const claim = RewardClaimService.updateStatus(claimId, status);
    return { success: true, claim };
  },

  async getConfig() {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const config = ConfigService.get();
    return { success: true, config };
  },

  async updateConfig(config: any) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    ConfigService.update(config);
    return { success: true, message: 'Configuration updated' };
  },

  async addAdminWallet(walletAddress: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    ConfigService.addAdminWallet(walletAddress);
    return { success: true, message: 'Admin wallet added' };
  },

  async givePass(memberId: string, passType: string, passKind: 'click' | 'publisher') {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    if (passKind === 'click') {
      const validClickTypes = ['Basic', 'Silver', 'Golden'];
      if (!validClickTypes.includes(passType)) {
        throw new Error(`Invalid click pass type. Must be one of: ${validClickTypes.join(', ')}`);
      }
      const pass = PassService.addClickPass(memberId, passType as 'Basic' | 'Silver' | 'Golden');
      return { success: true, pass };
    } else {
      const validPublisherTypes = ['Basic', 'Silver', 'Gold'];
      if (!validPublisherTypes.includes(passType)) {
        throw new Error(`Invalid publisher pass type. Must be one of: ${validPublisherTypes.join(', ')}`);
      }
      const pass = PassService.addPublisherPass(memberId, passType as 'Basic' | 'Silver' | 'Gold');
      return { success: true, pass };
    }
  },
};

// Export for backward compatibility
export const apiCall = async (endpoint: string, options: any = {}) => {
  // This is a placeholder for backward compatibility
  // The actual API calls should use the specific API objects above
  throw new Error('Direct apiCall is deprecated. Use specific API objects.');
};

export const checkAuth = async () => {
  const result = await AuthAPI.checkSession();
  return result.authenticated;
};
