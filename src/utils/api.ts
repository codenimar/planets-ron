  async login(address: string, walletType: string) {
    try {
      // Get config to check admin status
      const config = ConfigService.get();
      const isAdmin = config.admin_wallets.includes(address.toLowerCase());
      
      let member = MemberService.getByWalletAddress(address);
      
      if (!member) {
        member = MemberService.create(address, walletType);
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
