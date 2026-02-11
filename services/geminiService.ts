
import { GoogleGenAI, Type } from "@google/genai";

// Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key.
export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, appetizing, 1-sentence marketing description for a ${category} menu item named "${productName}".`,
    });
    return response.text?.trim() || "Deliciously prepared for you.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A customer favorite at LuminaPOS.";
  }
};

export const analyzeSales = async (orders: any[]): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const summary = orders.map(o => `${o.total} total, ${o.items.length} items`).join('; ');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze these recent sales: ${summary}. Give a brief 1-sentence business insight.`,
      });
      return response.text?.trim() || "Business is steady today.";
    } catch (error) {
      return "Keep up the great service!";
    }
}

export const analyzeProfitReport = async (revenue: number, profit: number, topItems: string[]): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a business consultant, analyze these restaurant stats: 
        Revenue: Rp ${revenue.toLocaleString()}, 
        Gross Profit: Rp ${profit.toLocaleString()}, 
        Top Selling Items: ${topItems.join(', ')}. 
        Provide a 2-sentence actionable strategic advice for the restaurant owner.`,
      });
      return response.text?.trim() || "Consistently track your high-margin items to maximize growth.";
    } catch (error) {
      return "Focus on promoting your most popular dishes to increase foot traffic.";
    }
}
