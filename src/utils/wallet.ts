import { ethers } from 'ethers';

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  balance: string | null;
}

export const connectMetamask = async (): Promise<WalletState> => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('Metamask is not installed');
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const address = accounts[0];
    const balance = await provider.getBalance(address);
    
    return {
      address,
      isConnected: true,
      balance: ethers.utils.formatEther(balance),
    };
  } catch (error) {
    console.error('Error connecting to Metamask:', error);
    throw error;
  }
};

export const disconnectWallet = (): WalletState => {
  return {
    address: null,
    isConnected: false,
    balance: null,
  };
};

export const truncateWalletAddress = (address: string, startChars: number = 6, endChars: number = 4): string => {
  if (!address || address.length < startChars + endChars) {
    return address;
  }
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};
