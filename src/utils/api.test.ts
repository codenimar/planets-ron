// Tests for XPostAPI.verifyAction error handling
import { XPostAPI } from './api';
import * as localStorage from './localStorage';

// Mock localStorage
jest.mock('./localStorage', () => ({
  ...jest.requireActual('./localStorage'),
  initializeStorage: jest.fn(),
  MemberService: {
    getById: jest.fn(),
    addPoints: jest.fn(),
  },
  SessionService: {
    getByToken: jest.fn(),
  },
  XPostService: {
    getById: jest.fn(),
  },
  XPostActionService: {
    getByMemberAndPost: jest.fn(),
    create: jest.fn(),
  },
  MemberAssetVerificationService: {
    hasActiveVerification: jest.fn(),
  },
}));

describe('XPostAPI.verifyAction - Error Handling', () => {
  const mockMember = {
    id: 'member-1',
    wallet_address: '0x123',
    x_handle: 'testuser',
    points: 100,
    is_admin: false,
  };

  const mockXPost = {
    id: 'post-1',
    post_url: 'https://x.com/test/status/123',
    image_url: 'https://example.com/image.jpg',
    is_active: true,
  };

  const mockAction = {
    id: 'action-1',
    post_id: 'post-1',
    member_id: 'member-1',
    action_type: 'like',
    points: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup localStorage mocks
    (localStorage as any).getSessionToken = jest.fn().mockReturnValue('test-token');
    (localStorage.SessionService.getByToken as jest.Mock).mockReturnValue({ member_id: 'member-1' });
    (localStorage.MemberService.getById as jest.Mock).mockReturnValue(mockMember);
    (localStorage.XPostService.getById as jest.Mock).mockReturnValue(mockXPost);
    (localStorage.XPostActionService.getByMemberAndPost as jest.Mock).mockReturnValue(null);
    (localStorage.XPostActionService.create as jest.Mock).mockReturnValue(mockAction);
    (localStorage.MemberAssetVerificationService.hasActiveVerification as jest.Mock).mockReturnValue(false);
    
    // Mock global fetch
    global.fetch = jest.fn();
    
    // Mock localStorage
    Storage.prototype.getItem = jest.fn().mockReturnValue('test-token');
    Storage.prototype.setItem = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should handle HTML 404 response gracefully (Content-Type check)', async () => {
    // Mock fetch to return HTML (simulating 404)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'text/html';
          return null;
        },
      },
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(result.points_earned).toBe(1);
    expect(localStorage.XPostActionService.create).toHaveBeenCalled();
    expect(localStorage.MemberService.addPoints).toHaveBeenCalled();
  });

  test('should handle null Content-Type gracefully', async () => {
    // Mock fetch to return response with null content-type
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      headers: {
        get: (name: string) => null,
      },
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
  });

  test('should handle JSON parsing errors gracefully', async () => {
    // Mock fetch to return response that claims to be JSON but isn't
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token < in JSON at position 0')),
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
  });

  test('should handle network errors gracefully', async () => {
    // Mock fetch to throw network error
    (global.fetch as jest.Mock).mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
  });

  test('should verify normally when API returns valid JSON with verified=true', async () => {
    // Mock fetch to return valid success response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ verified: true }),
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(localStorage.XPostActionService.create).toHaveBeenCalled();
  });

  test('should throw error when user has not completed action (verified=false)', async () => {
    // Mock fetch to return verified=false
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ verified: false }),
    });

    await expect(XPostAPI.verifyAction('post-1', 'like')).rejects.toThrow(
      'Please complete the like action on X.com first'
    );

    expect(localStorage.XPostActionService.create).not.toHaveBeenCalled();
  });

  test('should throw error when API returns error for user action (not config error)', async () => {
    // Mock fetch to return error response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ error: 'User has not liked this post' }),
    });

    await expect(XPostAPI.verifyAction('post-1', 'like')).rejects.toThrow(
      'User has not liked this post'
    );

    expect(localStorage.XPostActionService.create).not.toHaveBeenCalled();
  });

  test('should allow action when API returns Bearer Token not configured error', async () => {
    // Mock fetch to return Bearer Token error (backwards compatibility)
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ error: 'Bearer Token not configured' }),
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(localStorage.XPostActionService.create).toHaveBeenCalled();
  });

  test('should handle unknown errors gracefully', async () => {
    // Mock fetch to throw unknown error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Unknown error occurred'));

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
  });

  test('should handle JSON parsing errors even when isUserVerificationFailure is set', async () => {
    // Mock fetch to return non-ok response with invalid JSON
    // This simulates the edge case where response.ok is false (sets isUserVerificationFailure to true)
    // but then response.json() throws a SyntaxError
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token < in JSON at position 0')),
    });

    // Should allow action because it's a JSON parsing error (technical), not a user verification failure
    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.verified).toBe(true);
    expect(localStorage.XPostActionService.create).toHaveBeenCalled();
  });

  test('should throw error when X handle is not set', async () => {
    // Mock member without X handle
    (localStorage.MemberService.getById as jest.Mock).mockReturnValue({
      ...mockMember,
      x_handle: null,
    });

    await expect(XPostAPI.verifyAction('post-1', 'like')).rejects.toThrow(
      'Please set your X.com handle first'
    );
  });

  test('should throw error when action already exists', async () => {
    // Mock existing action
    (localStorage.XPostActionService.getByMemberAndPost as jest.Mock).mockReturnValue(mockAction);

    await expect(XPostAPI.verifyAction('post-1', 'like')).rejects.toThrow(
      'You have already completed this action'
    );
  });

  test('should give bonus points when member has asset verification', async () => {
    // Mock asset verification
    (localStorage.MemberAssetVerificationService.hasActiveVerification as jest.Mock).mockReturnValue(true);

    // Mock fetch to return valid success response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ verified: true }),
    });

    const result = await XPostAPI.verifyAction('post-1', 'like');

    expect(result.success).toBe(true);
    expect(result.points_earned).toBe(2); // 1 base + 1 bonus
  });

  test('should give referral bonus when member was referred and does retweet', async () => {
    // Mock member with referrer
    (localStorage.MemberService.getById as jest.Mock).mockReturnValue({
      ...mockMember,
      referred_by: 'referrer-id',
    });

    // Mock fetch to return valid success response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: (name: string) => {
          if (name === 'content-type') return 'application/json';
          return null;
        },
      },
      json: jest.fn().mockResolvedValue({ verified: true }),
    });

    const result = await XPostAPI.verifyAction('post-1', 'retweet');

    expect(result.success).toBe(true);
    // Verify referrer gets 1 point
    expect(localStorage.MemberService.addPoints).toHaveBeenCalledWith(
      'referrer-id',
      1,
      'Referral retweet bonus',
      'member-1'
    );
  });
});
