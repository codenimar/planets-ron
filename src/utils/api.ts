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
  MessageService,
  RewardDistributionService,
  XPostService,
  XPostActionService,
  FeaturedAssetService,
  MemberAssetVerificationService,
  WeeklyRewardService,
  WeeklyWinnerService,
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
  async login(address: string, walletType: string, referralCode?: string) {
    try {
      // Get config to check admin status
      const config = ConfigService.get();
      const isAdmin = config.admin_wallets.includes(address.toLowerCase());
      
      let member = MemberService.getByWalletAddress(address);
      
      if (!member) {
        member = MemberService.create(address, walletType, referralCode);
      } else {
        // Update both last_login AND is_admin status
        MemberService.update(member.id, { 
          last_login: new Date().toISOString(),
          is_admin: isAdmin
        });
        
        // Refresh the member object to get updated data
        member = MemberService.getById(member.id)!;
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

  async updateXHandle(xHandle: string) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    // Validate X handle format (optional @ prefix, alphanumeric and underscore)
    const cleanHandle = xHandle.replace('@', '');
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      throw new Error('Invalid X.com handle format');
    }

    const updatedMember = MemberService.update(member.id, { x_handle: cleanHandle });
    return { success: true, member: updatedMember };
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

  async getAllMembers() {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const members = MemberService.getAll();
    return { success: true, members };
  },

  async updateMember(memberId: string, updates: Partial<Member>) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const updatedMember = MemberService.update(memberId, updates);
    return { success: true, member: updatedMember };
  },

  async recordRewardDistribution(rewardId: string, memberId: string, notes: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const distribution = RewardDistributionService.create(rewardId, memberId, notes);
    return { success: true, distribution };
  },

  async getRecentDistributions(limit: number = 10) {
    const distributions = RewardDistributionService.getRecent(limit);
    const distributionsWithDetails = distributions.map(d => ({
      ...d,
      reward: RewardService.getById(d.reward_id),
      member: MemberService.getById(d.member_id),
    }));
    return { success: true, distributions: distributionsWithDetails };
  },
};

// Message API
export const MessageAPI = {
  async getMessages() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const messages = MessageService.getByRecipient(member.id);
    const messagesWithSender = messages.map(msg => ({
      ...msg,
      from_member: MemberService.getById(msg.from_member_id),
    }));

    return { success: true, messages: messagesWithSender };
  },

  async getUnreadCount() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const count = MessageService.getUnreadCount(member.id);
    return { success: true, count };
  },

  async markAsRead(messageId: string) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const message = MessageService.markAsRead(messageId);
    return { success: true, message };
  },

  async sendMessage(toMemberId: string | null, subject: string, content: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required to send messages');

    const message = MessageService.create(member.id, toMemberId, subject, content);
    return { success: true, message };
  },

  async deleteMessage(messageId: string) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    MessageService.delete(messageId);
    return { success: true };
  },
};

// Referral API
export const ReferralAPI = {
  async getReferrals() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const referrals = MemberService.getReferrals(member.id);
    return { success: true, referrals };
  },

  async getReferralStats() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const referrals = MemberService.getReferrals(member.id);
    const totalReferrals = referrals.length;
    
    // Count how many referrals have claimed prizes
    let referralsWithClaims = 0;
    referrals.forEach(referral => {
      const claims = RewardClaimService.getByMember(referral.id);
      if (claims.length > 0) {
        referralsWithClaims++;
      }
    });

    return {
      success: true,
      stats: {
        total_referrals: totalReferrals,
        referrals_with_claims: referralsWithClaims,
        referral_code: member.referral_code,
      },
    };
  },

  async generateReferralCode() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const updatedMember = MemberService.ensureReferralCode(member.id);
    if (!updatedMember) {
      throw new Error('Failed to generate referral code. Member not found.');
    }

    return {
      success: true,
      referral_code: updatedMember.referral_code,
      member: updatedMember,
    };
  },
};

// X Post API
export const XPostAPI = {
  async getAll() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const posts = XPostService.getActive();
    return { success: true, posts };
  },

  async create(postUrl: string, imageUrl: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const post = XPostService.create(postUrl, imageUrl, member.id);
    return { success: true, post };
  },

  async update(postId: string, updates: { post_url?: string; image_url?: string; is_active?: boolean }) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const post = XPostService.update(postId, updates);
    return { success: true, post };
  },

  async delete(postId: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    XPostService.delete(postId);
    return { success: true };
  },

  async verifyAction(postId: string, actionType: 'follow' | 'like' | 'retweet') {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    // Check if X handle is set
    if (!member.x_handle) {
      throw new Error('Please set your X.com handle first');
    }

    // Check if action already exists
    const existingAction = XPostActionService.getByMemberAndPost(member.id, postId, actionType);
    if (existingAction) {
      throw new Error(`You have already completed this action`);
    }

    // Get the X post to verify against
    const xPost = XPostService.getById(postId);
    if (!xPost) {
      throw new Error('Post not found');
    }

    // Call backend API to verify the action on X.com
    let verified = false;
    try {
      const endpoint = `/api/verify-${actionType}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xHandle: member.x_handle,
          postUrl: xPost.post_url,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        // Check if this is an API configuration error (backwards compatibility)
        if (data.error && data.error.includes('Bearer Token not configured')) {
          console.warn('X API not configured, allowing action without verification');
          verified = true;
        } else {
          // This is a real verification failure - user hasn't completed the action
          throw new Error(data.error || `Verification failed. Please complete the ${actionType} action on X.com first, then try again.`);
        }
      } else {
        verified = data.verified;
        
        if (!verified) {
          // User hasn't actually completed the action on X.com
          throw new Error(`Please complete the ${actionType} action on X.com first, then try again. Make sure you're logged into X.com with the account @${member.x_handle}.`);
        }
      }
    } catch (error: any) {
      // Handle network errors differently from verification errors
      if (error.message.includes('Please complete') || error.message.includes('Please set')) {
        // This is a user-facing error - re-throw it
        throw error;
      }
      
      // Network error or API unavailable - check if it's a fetch error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error or API unavailable, allowing action without verification:', error);
        verified = true;
      } else {
        // Unknown error - be safe and reject
        throw new Error(`Verification error: ${error.message}. Please try again later.`);
      }
    }

    // Calculate points: 1 base point + bonus if holding featured assets
    let points = 1;
    const hasAssetBonus = MemberAssetVerificationService.hasActiveVerification(member.id);
    if (hasAssetBonus) {
      points = 2; // 1 base + 1 bonus
    }

    // Create action
    const action = XPostActionService.create(postId, member.id, actionType, points);

    // Add points to member
    MemberService.addPoints(member.id, points, `${actionType} action on X post`, postId);

    // If member was referred, give referrer 1 point for retweet
    if (actionType === 'retweet' && member.referred_by) {
      MemberService.addPoints(member.referred_by, 1, 'Referral retweet bonus', member.id);
    }

    return {
      success: true,
      action,
      points_earned: points,
      message: `Earned ${points} points for ${actionType}!`,
      verified,
    };
  },

  async getMyActions() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const actions = XPostActionService.getByMember(member.id);
    return { success: true, actions };
  },
};

// Featured Asset API
export const FeaturedAssetAPI = {
  async getAll() {
    const assets = FeaturedAssetService.getActive();
    return { success: true, assets };
  },

  async create(
    assetType: 'nft_collection' | 'token',
    name: string,
    contractAddress: string,
    requiredAmount: number,
    bonusMultiplier: number
  ) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const asset = FeaturedAssetService.create(assetType, name, contractAddress, requiredAmount, bonusMultiplier);
    return { success: true, asset };
  },

  async update(assetId: string, updates: Partial<any>) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const asset = FeaturedAssetService.update(assetId, updates);
    return { success: true, asset };
  },

  async delete(assetId: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    FeaturedAssetService.delete(assetId);
    return { success: true };
  },

  async verifyAsset(assetId: string) {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    // Check cooldown
    if (!MemberAssetVerificationService.canVerify(member.id, assetId)) {
      throw new Error('Verification on cooldown. Please wait 1 hour between verifications.');
    }

    const asset = FeaturedAssetService.getById(assetId);
    if (!asset) throw new Error('Asset not found');

    // In a real implementation, this would call Ronin RPC
    // For now, we'll simulate verification
    // TODO: Implement actual Ronin RPC calls
    const verified = await checkRoninAsset(member.wallet_address, asset);

    // Update or create verification
    MemberAssetVerificationService.update(member.id, assetId, verified);

    return {
      success: true,
      verified,
      message: verified
        ? `Asset verified! You'll earn bonus points on actions.`
        : `Asset verification failed. Make sure you hold the required amount.`,
    };
  },

  async getMyVerifications() {
    const member = getCurrentMember();
    if (!member) throw new Error('Not authenticated');

    const verifications = MemberAssetVerificationService.getByMember(member.id);
    return { success: true, verifications };
  },
};

// Placeholder for Ronin RPC integration
async function checkRoninAsset(walletAddress: string, asset: any): Promise<boolean> {
  // TODO: Implement actual Ronin RPC calls
  // For now, return true for demonstration
  console.log(`Checking Ronin asset for ${walletAddress}:`, asset);
  return true;
}

// Weekly Reward API
export const WeeklyRewardAPI = {
  async getCurrent() {
    const currentWeek = WeeklyRewardService.getActive();
    return { success: true, weekly_reward: currentWeek };
  },

  async create(weekStart: string, weekEnd: string, itemName: string, itemQuantity: number) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const weeklyReward = WeeklyRewardService.create(weekStart, weekEnd, itemName, itemQuantity);
    return { success: true, weekly_reward: weeklyReward };
  },

  async update(weeklyRewardId: string, updates: Partial<any>) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const weeklyReward = WeeklyRewardService.update(weeklyRewardId, updates);
    return { success: true, weekly_reward: weeklyReward };
  },

  async restartWeek(itemName: string, itemQuantity: number) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    // Get current week to generate winners before deactivating
    const currentWeek = WeeklyRewardService.getActive();
    if (currentWeek) {
      // Generate winners list
      WeeklyWinnerService.generateWinnersList(currentWeek.id);
      
      // Deactivate current week
      WeeklyRewardService.update(currentWeek.id, { is_active: false });
    }

    // Create new week
    const now = new Date();
    const weekStart = now.toISOString();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const newWeek = WeeklyRewardService.create(weekStart, weekEnd, itemName, itemQuantity);

    return { success: true, weekly_reward: newWeek, message: 'Week restarted successfully' };
  },

  async getWinners(weeklyRewardId: string) {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const winners = WeeklyWinnerService.getByWeeklyReward(weeklyRewardId);
    const winnersWithDetails = winners.map(w => ({
      ...w,
      member: MemberService.getById(w.member_id),
    }));

    return { success: true, winners: winnersWithDetails };
  },

  async getAllWeeks() {
    const member = getCurrentMember();
    if (!member?.is_admin) throw new Error('Admin access required');

    const weeks = WeeklyRewardService.getAll();
    return { success: true, weekly_rewards: weeks };
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