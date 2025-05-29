
export interface WalletPersonaResponse {
  persona: string;
  risk_score: number;
  bio: string;
  timeline: Array<{
    event: string;
    date: string;
    value?: string;
  }>;
  metrics?: {
    totalValue: string;
    transactions: number;
    protocols: number;
  };
  badges?: Array<{
    label: string;
    description: string;
  }>;
}

const SUPABASE_URL = 'https://rhiozairbkcntfyvqykd.supabase.co';

export const analyzeWallet = async (walletAddress: string): Promise<WalletPersonaResponse> => {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wallet_address: walletAddress }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Invalid wallet address format');
    }
    if (response.status === 404) {
      throw new Error('No on-chain footprint found for this wallet');
    }
    throw new Error('Failed to analyze wallet. Please try again.');
  }

  return response.json();
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/health`);
    return response.ok;
  } catch {
    return false;
  }
};
