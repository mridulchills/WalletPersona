
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Copy, Download, ExternalLink } from "lucide-react";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { WalletPersonaResponse } from "@/services/walletApi";

interface ShareCardProps {
  walletData: WalletPersonaResponse;
  walletAddress: string;
  onClose: () => void;
}

export const ShareCard = ({ walletData, walletAddress, onClose }: ShareCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Check out my wallet personality: ${window.location.href}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTweet = () => {
    const text = `Just discovered I'm "${walletData.persona}" 🔮\n\nCheck out your wallet's personality at WalletPersona! 🕵️‍♂️`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Create a temporary div with the report content
      const reportContent = document.createElement('div');
      reportContent.style.cssText = `
        width: 210mm;
        min-height: 297mm;
        margin: 0;
        padding: 20mm;
        background: linear-gradient(135deg, #1e293b 0%, #7c3aed 50%, #1e293b 100%);
        color: white;
        font-family: Arial, sans-serif;
        box-sizing: border-box;
      `;
      
      reportContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 36px; margin: 0 0 10px 0; background: linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">WalletPersona Report</h1>
          <p style="font-size: 14px; opacity: 0.8; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; margin-bottom: 30px; border: 1px solid rgba(139,92,246,0.3);">
          <h2 style="font-size: 32px; margin: 0 0 15px 0; text-align: center;">${walletData.persona}</h2>
          <p style="font-size: 16px; font-style: italic; text-align: center; margin: 0 0 20px 0; opacity: 0.9;">"${walletData.bio}"</p>
          <p style="font-size: 12px; text-align: center; opacity: 0.7; margin: 0;">Wallet: ${walletAddress}</p>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="background: rgba(6,182,212,0.2); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(6,182,212,0.3);">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #06b6d4;">${walletData.risk_score}/100</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Risk Score</p>
          </div>
          <div style="background: rgba(34,197,94,0.2); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(34,197,94,0.3);">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #22c55e;">${walletData.metrics?.totalValue || "Unknown"}</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Portfolio Value</p>
          </div>
          <div style="background: rgba(139,92,246,0.2); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(139,92,246,0.3);">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #8b5cf6;">${walletData.metrics?.transactions || 0}</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Transactions</p>
          </div>
          <div style="background: rgba(236,72,153,0.2); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid rgba(236,72,153,0.3);">
            <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #ec4899;">${walletData.metrics?.protocols || 0}</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.8;">Protocols Used</p>
          </div>
        </div>
        
        ${walletData.timeline?.length ? `
        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; margin-bottom: 30px; border: 1px solid rgba(139,92,246,0.3);">
          <h3 style="font-size: 20px; margin: 0 0 20px 0; text-align: center;">Wallet Timeline</h3>
          ${walletData.timeline.map(event => `
            <div style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
              <h4 style="margin: 0 0 5px 0; font-size: 16px;">${event.event}</h4>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">${event.date}${event.value ? ` • ${event.value}` : ''}</p>
            </div>
          `).join('')}
        </div>
        ` : ''}
        
        ${walletData.badges?.length ? `
        <div style="background: rgba(255,255,255,0.1); border-radius: 16px; padding: 30px; border: 1px solid rgba(139,92,246,0.3);">
          <h3 style="font-size: 20px; margin: 0 0 20px 0; text-align: center;">Achievements</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;">
            ${walletData.badges.map(badge => `
              <div style="background: linear-gradient(45deg, #8b5cf6, #06b6d4); padding: 8px 16px; border-radius: 20px; font-size: 12px;">
                ${badge.label}
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.2);">
          <p style="font-size: 12px; opacity: 0.6; margin: 0;">Generated by WalletPersona • Discover your wallet's personality</p>
        </div>
      `;
      
      // Temporarily add to DOM for rendering
      document.body.appendChild(reportContent);
      
      // Use html2canvas and jsPDF
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      const canvas = await html2canvas(reportContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });
      
      // Remove from DOM
      document.body.removeChild(reportContent);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `wallet-persona-${walletAddress.slice(0, 6)}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Map persona name to avatar type
  const getAvatarType = (persona: string): string => {
    const lowerPersona = persona.toLowerCase();
    if (lowerPersona.includes('wizard') || lowerPersona.includes('defi')) return 'wizard';
    if (lowerPersona.includes('king') || lowerPersona.includes('whale')) return 'king';
    if (lowerPersona.includes('warrior') || lowerPersona.includes('trader')) return 'warrior';
    if (lowerPersona.includes('guardian') || lowerPersona.includes('hodl')) return 'guardian';
    if (lowerPersona.includes('pioneer') || lowerPersona.includes('early')) return 'pioneer';
    if (lowerPersona.includes('social') || lowerPersona.includes('dao')) return 'socialite';
    return 'wizard';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border border-purple-500/30 relative overflow-hidden">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Share card content */}
        <div className="p-8 text-center bg-gradient-to-br from-purple-900/80 to-cyan-900/80">
          <div className="mb-6">
            <PersonaAvatar type={getAvatarType(walletData.persona)} />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {walletData.persona}
          </h2>

          <p className="text-gray-300 text-sm mb-6">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-cyan-400 font-bold">{walletData.risk_score}/100</div>
              <div className="text-gray-400">Risk Score</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-green-400 font-bold">{walletData.metrics?.totalValue || "Unknown"}</div>
              <div className="text-gray-400">Portfolio</div>
            </div>
          </div>

          <div className="text-xs text-gray-400 mb-6">
            Analyzed by WalletPersona
          </div>

          {/* QR Code placeholder */}
          <div className="w-20 h-20 bg-gray-700 rounded-lg mx-auto mb-6 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fff'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23000'/%3E%3Crect x='30' y='10' width='10' height='10' fill='%23000'/%3E%3Crect x='50' y='10' width='10' height='10' fill='%23000'/%3E%3Crect x='70' y='10' width='10' height='10' fill='%23000'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover'
            }}></div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="p-6 space-y-3">
          <Button
            onClick={handleCopy}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleTweet}
              variant="outline"
              className="border-cyan-500 text-cyan-400 hover:bg-cyan-500/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Tweet
            </Button>
            <Button
              onClick={generatePDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? "Generating..." : "Save PDF"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
