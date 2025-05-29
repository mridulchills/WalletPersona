# Spendora 💸🔍

**Unlock Ethereum Wallet Insights with AI**

Spendora is a full-stack web application that analyzes any Ethereum wallet address to generate personality profiles, risk assessments, and personalized DeFi recommendations. Built for blockchain transparency, powered by on-chain data, and enhanced with AI.

---

## 🚀 Features

- 🔗 On-chain persona classification (e.g., NFT Collector, DeFi Degenerate, HODLer)
- 🛡️ Risk scoring algorithm (0–100) based on wallet activity
- 🧠 AI-generated bios using Google Gemini API
- 📊 Wallet timeline + protocol interaction visualization
- 💡 Personalized DeFi/NFT recommendations
- 📄 One-click PDF report export

---

## 🧰 Tech Stack

**Frontend:**  
- React + Vite + TypeScript  
- Tailwind CSS + Shadcn UI  
- React Router + React Query  

**Backend & Infra:**  
- Supabase (DB, Auth, Edge Functions)  
- PostgreSQL (with RLS enabled)  
- Etherscan API (on-chain data)

**AI Layer:**  
- Google Gemini (for bios, fallback to default curated bios)

**Others:**  
- jsPDF + html2canvas (PDF export)  
- Lucide Icons, ENS support, Caching logic  

---

## 📦 Installation

```bash
git clone https://github.com/mridulchills/WalletPersona.git
cd spendora
npm install
npm run dev

