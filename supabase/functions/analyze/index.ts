
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WalletData {
  balance: string;
  txCount: number;
  tokens: any[];
  nfts: any[];
  defiProtocols: string[];
  firstTx?: string;
  lastTx?: string;
}

interface PersonaResult {
  persona: string;
  risk_score: number;
  bio: string;
  timeline: Array<{
    event: string;
    date: string;
    value?: string;
  }>;
  metrics: {
    totalValue: string;
    transactions: number;
    protocols: number;
  };
  badges: Array<{
    label: string;
    description: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { wallet_address } = await req.json();
    
    if (!wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Wallet address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedAddress = wallet_address.toLowerCase().trim();
    
    // Validate wallet address format
    if (!isValidWalletAddress(normalizedAddress)) {
      return new Response(
        JSON.stringify({ error: 'Invalid wallet address format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing wallet:', normalizedAddress);

    // Log API usage
    await logApiUsage(supabase, normalizedAddress, 'analyze', req);

    // Check if we have cached analysis (within last 24 hours)
    const { data: existingAnalysis } = await supabase
      .from('wallet_analyses')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existingAnalysis) {
      console.log('Returning cached analysis for:', normalizedAddress);
      return await formatCachedResponse(supabase, existingAnalysis);
    }

    // Fetch wallet data from multiple sources
    console.log('Fetching fresh data for:', normalizedAddress);
    const walletData = await fetchWalletData(normalizedAddress);
    
    if (!walletData) {
      return new Response(
        JSON.stringify({ error: 'No on-chain footprint found for this wallet' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing wallet data...');
    // Process data and generate persona
    const analysis = await processWalletData(walletData, normalizedAddress);
    
    console.log('Storing analysis...');
    // Store in database
    await storeAnalysis(supabase, normalizedAddress, analysis);
    
    console.log('Analysis complete for:', normalizedAddress);
    // Return response
    return new Response(
      JSON.stringify(analysis),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze wallet. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function isValidWalletAddress(address: string): boolean {
  // Check for 0x format (42 characters)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return true;
  }
  
  // Check for ENS format
  if (/^[a-zA-Z0-9-]+\.eth$/.test(address)) {
    return true;
  }
  
  return false;
}

async function logApiUsage(supabase: any, walletAddress: string, endpoint: string, req: Request) {
  try {
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    await supabase.from('api_usage').insert({
      wallet_address: walletAddress,
      endpoint: endpoint,
      ip_address: clientIP,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

async function fetchWalletData(address: string): Promise<WalletData | null> {
  const etherscanKey = Deno.env.get('ETHERSCAN_API_KEY');
  
  if (!etherscanKey) {
    console.error('ETHERSCAN_API_KEY not configured');
    return null;
  }
  
  try {
    console.log('Fetching balance...');
    // Fetch basic wallet info from Etherscan with timeout
    const balanceResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!balanceResponse.ok) {
      console.error('Balance API error:', balanceResponse.status);
      return null;
    }
    
    const balanceData = await balanceResponse.json();
    console.log('Balance data:', balanceData);
    
    console.log('Fetching transaction count...');
    const txCountResponse = await fetch(
      `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${etherscanKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    
    if (!txCountResponse.ok) {
      console.error('TxCount API error:', txCountResponse.status);
      return null;
    }
    
    const txCountData = await txCountResponse.json();
    console.log('TxCount data:', txCountData);
    
    // Check if wallet has any activity
    const txCount = parseInt(txCountData.result, 16);
    if (balanceData.status !== '1' || txCount === 0) {
      console.log('No activity found for wallet');
      return null;
    }
    
    console.log('Fetching transaction history...');
    // Fetch transaction history (limited) with timeout
    const txHistoryResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${etherscanKey}`,
      { signal: AbortSignal.timeout(15000) }
    );
    
    let transactions = [];
    if (txHistoryResponse.ok) {
      const txHistoryData = await txHistoryResponse.json();
      transactions = txHistoryData.result || [];
    }
    
    console.log('Fetching token transfers...');
    // Fetch ERC20 token transfers with timeout
    const tokenResponse = await fetch(
      `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=50&sort=desc&apikey=${etherscanKey}`,
      { signal: AbortSignal.timeout(15000) }
    );
    
    let tokens = [];
    if (tokenResponse.ok) {
      const tokenData = await tokenResponse.json();
      tokens = tokenData.result || [];
    }
    
    // Extract unique protocols/contracts interacted with
    const protocols = new Set<string>();
    transactions.forEach((tx: any) => {
      if (tx.to && tx.to !== address && tx.to !== '0x0000000000000000000000000000000000000000') {
        protocols.add(tx.to.toLowerCase());
      }
    });
    
    const walletData = {
      balance: balanceData.result,
      txCount: txCount,
      tokens: tokens.slice(0, 20),
      nfts: [],
      defiProtocols: Array.from(protocols).slice(0, 10),
      firstTx: transactions.length > 0 ? transactions[transactions.length - 1].timeStamp : undefined,
      lastTx: transactions.length > 0 ? transactions[0].timeStamp : undefined
    };
    
    console.log('Wallet data fetched successfully:', {
      balance: walletData.balance,
      txCount: walletData.txCount,
      tokensCount: walletData.tokens.length,
      protocolsCount: walletData.defiProtocols.length
    });
    
    return walletData;
    
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return null;
  }
}

async function processWalletData(walletData: WalletData, address: string): Promise<PersonaResult> {
  // Classify persona based on wallet behavior
  const persona = classifyPersona(walletData);
  
  // Calculate risk score
  const riskScore = calculateRiskScore(walletData);
  
  // Generate bio using Gemini
  const bio = await generateBio(persona, walletData);
  
  // Generate timeline
  const timeline = generateTimeline(walletData);
  
  // Generate badges
  const badges = generateBadges(walletData, persona);
  
  // Calculate metrics
  const totalValueEth = parseFloat(walletData.balance) / 1e18;
  const metrics = {
    totalValue: `${totalValueEth.toFixed(4)} ETH`,
    transactions: walletData.txCount,
    protocols: walletData.defiProtocols.length
  };
  
  return {
    persona,
    risk_score: riskScore,
    bio,
    timeline,
    metrics,
    badges
  };
}

function classifyPersona(walletData: WalletData): string {
  const { txCount, tokens, defiProtocols, balance } = walletData;
  const balanceEth = parseFloat(balance) / 1e18;
  
  // DeFi Degenerate: High transaction count, many protocols
  if (txCount > 500 && defiProtocols.length > 5) {
    return 'DeFi Degenerate';
  }
  
  // HODLer: Low transaction count, high balance
  if (txCount < 50 && balanceEth > 1) {
    return 'Diamond Hands HODLer';
  }
  
  // NFT Collector: Many token transfers (could be NFTs)
  if (tokens.length > 20) {
    return 'NFT Collector';
  }
  
  // Yield Farmer: Moderate activity with DeFi protocols
  if (txCount > 100 && defiProtocols.length > 2) {
    return 'Yield Farmer';
  }
  
  // Blue Chip Investor: Moderate balance, few transactions
  if (balanceEth > 0.5 && txCount < 100) {
    return 'Blue Chip Investor';
  }
  
  // Protocol Explorer: Many different protocols
  if (defiProtocols.length > 3) {
    return 'Protocol Explorer';
  }
  
  // Newcomer: Very low activity
  if (txCount < 10) {
    return 'Crypto Newcomer';
  }
  
  // Default
  return 'Crypto Enthusiast';
}

function calculateRiskScore(walletData: WalletData): number {
  let score = 50; // Base score
  
  const balanceEth = parseFloat(walletData.balance) / 1e18;
  const { txCount, defiProtocols } = walletData;
  
  // Higher balance = lower risk
  if (balanceEth > 10) score -= 20;
  else if (balanceEth > 1) score -= 10;
  else if (balanceEth < 0.01) score += 15;
  
  // More transactions = potentially higher risk (but also more experience)
  if (txCount > 1000) score += 15;
  else if (txCount > 100) score += 5;
  else if (txCount < 10) score += 10;
  
  // More protocols = higher risk
  if (defiProtocols.length > 10) score += 20;
  else if (defiProtocols.length > 5) score += 10;
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, score));
}

async function generateBio(persona: string, walletData: WalletData): Promise<string> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiKey) {
    return getDefaultBio(persona);
  }
  
  try {
    const balanceEth = (parseFloat(walletData.balance) / 1e18).toFixed(2);
    const prompt = `Create a witty, short bio (2-3 sentences) for a crypto wallet persona: "${persona}". 
    Wallet stats: ${walletData.txCount} transactions, ${balanceEth} ETH balance, ${walletData.defiProtocols.length} protocols used. 
    Make it fun and crypto-native with some humor. Don't use too many emojis.`;
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    }
    
    return getDefaultBio(persona);
    
  } catch (error) {
    console.error('Error generating bio with Gemini:', error);
    return getDefaultBio(persona);
  }
}

function getDefaultBio(persona: string): string {
  const bios: Record<string, string> = {
    'DeFi Degenerate': 'Lives and breathes DeFi protocols. Probably has more yield farms than friends. Risk tolerance: Yes.',
    'NFT Collector': 'Collects digital art like it\'s going out of style. Portfolio is more colorful than their personality.',
    'Diamond Hands HODLer': 'Diamond hands since day one. Hasn\'t checked portfolio prices since 2021 (lies, checks hourly).',
    'DAO Governance Expert': 'Votes on everything, even what to have for lunch. Governance token maximalist.',
    'Yield Farmer': 'Chasing yields across the DeFi landscape. APY hunter extraordinaire.',
    'Memecoin Enthusiast': 'Buys the hype, sells the news. Portfolio chart looks like a seismograph.',
    'Blue Chip Investor': 'Only buys the top 10. Conservative by crypto standards, reckless by traditional ones.',
    'Protocol Explorer': 'Tries every new protocol. Beta tester by choice, bug finder by accident.',
    'Liquidity Provider': 'Provides liquidity to the masses. Impermanent loss is just a suggestion.',
    'Crypto Newcomer': 'Fresh to the space but eager to learn. Still figuring out the difference between staking and stacking.',
    'Crypto Enthusiast': 'A mysterious crypto enthusiast navigating the blockchain wilderness with style.'
  };
  
  return bios[persona] || 'A mysterious crypto enthusiast navigating the blockchain wilderness.';
}

function generateTimeline(walletData: WalletData): Array<{event: string; date: string; value?: string}> {
  const timeline = [];
  
  if (walletData.firstTx) {
    const firstDate = new Date(parseInt(walletData.firstTx) * 1000);
    timeline.push({
      event: 'First Transaction',
      date: firstDate.toISOString().split('T')[0],
      value: 'Entered the crypto space'
    });
  }
  
  if (walletData.tokens.length > 0) {
    timeline.push({
      event: 'Token Activity',
      date: new Date().toISOString().split('T')[0],
      value: `Interacted with ${walletData.tokens.length} different tokens`
    });
  }
  
  if (walletData.defiProtocols.length > 0) {
    timeline.push({
      event: 'DeFi Exploration',
      date: new Date().toISOString().split('T')[0],
      value: `Used ${walletData.defiProtocols.length} different protocols`
    });
  }
  
  return timeline;
}

function generateBadges(walletData: WalletData, persona: string): Array<{label: string; description: string}> {
  const badges = [];
  
  if (walletData.txCount > 100) {
    badges.push({
      label: 'Active Trader',
      description: 'Made over 100 transactions'
    });
  }
  
  if (walletData.defiProtocols.length > 5) {
    badges.push({
      label: 'Protocol Explorer',
      description: 'Interacted with multiple DeFi protocols'
    });
  }
  
  const balanceEth = parseFloat(walletData.balance) / 1e18;
  if (balanceEth > 1) {
    badges.push({
      label: 'Whale Spotter',
      description: 'Holds significant ETH balance'
    });
  }
  
  if (persona.includes('HODLer')) {
    badges.push({
      label: 'Diamond Hands',
      description: 'True HODLer mentality'
    });
  }
  
  return badges;
}

async function storeAnalysis(supabase: any, walletAddress: string, analysis: PersonaResult) {
  try {
    // Insert or update wallet analysis
    await supabase
      .from('wallet_analyses')
      .upsert({
        wallet_address: walletAddress,
        persona: analysis.persona,
        risk_score: analysis.risk_score,
        bio: analysis.bio,
        total_value: parseFloat(analysis.metrics.totalValue.split(' ')[0]),
        transaction_count: analysis.metrics.transactions,
        protocol_count: analysis.metrics.protocols
      }, { onConflict: 'wallet_address' });
    
    // Delete existing timeline events and badges
    await supabase.from('timeline_events').delete().eq('wallet_address', walletAddress);
    await supabase.from('wallet_badges').delete().eq('wallet_address', walletAddress);
    
    // Insert timeline events
    if (analysis.timeline.length > 0) {
      await supabase.from('timeline_events').insert(
        analysis.timeline.map(event => ({
          wallet_address: walletAddress,
          event: event.event,
          event_date: event.date,
          value: event.value
        }))
      );
    }
    
    // Insert badges
    if (analysis.badges.length > 0) {
      await supabase.from('wallet_badges').insert(
        analysis.badges.map(badge => ({
          wallet_address: walletAddress,
          label: badge.label,
          description: badge.description
        }))
      );
    }
    
  } catch (error) {
    console.error('Error storing analysis in database:', error);
  }
}

async function formatCachedResponse(supabase: any, analysis: any) {
  // Fetch timeline events
  const { data: timelineData } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('wallet_address', analysis.wallet_address)
    .order('event_date', { ascending: true });
  
  // Fetch badges
  const { data: badgesData } = await supabase
    .from('wallet_badges')
    .select('*')
    .eq('wallet_address', analysis.wallet_address);
  
  const response = {
    persona: analysis.persona,
    risk_score: analysis.risk_score,
    bio: analysis.bio,
    timeline: timelineData?.map(t => ({
      event: t.event,
      date: t.event_date,
      value: t.value
    })) || [],
    metrics: {
      totalValue: `${analysis.total_value} ETH`,
      transactions: analysis.transaction_count,
      protocols: analysis.protocol_count
    },
    badges: badgesData?.map(b => ({
      label: b.label,
      description: b.description
    })) || []
  };
  
  return new Response(
    JSON.stringify(response),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}
