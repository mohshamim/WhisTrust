/**
 * Test Gemini API Key
 * Run: node test-gemini-key.js
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Read .env.local file
function getEnvVar(key) {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const content = fs.readFileSync(envPath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.+)$`, "m"));
  return match ? match[1].trim() : null;
}

const API_KEY = getEnvVar("GEMINI_API_KEY");

if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in .env.local");
  process.exit(1);
}

console.log("🔑 Testing Gemini API Key...");
console.log(`Key (first 20 chars): ${API_KEY.substring(0, 20)}...`);
console.log("");

async function testAPIKey() {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Updated to gemini-2.5-flash which has available quota
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    console.log("📡 Sending test request...");
    const prompt = "Say 'Hello' in one word.";
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("✅ API Key is VALID and WORKING!");
    console.log(`Response: ${text}`);
    console.log("");
    console.log("✅ Your API key has quota available.");
    console.log("✅ You can use Smart Search feature.");
    
  } catch (error) {
    console.error("❌ API Key Test Failed!");
    console.error("");
    
    const errorMessage = error.message || "";
    
    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      console.error("🚫 QUOTA EXCEEDED:");
      console.error("   - Your free tier quota has been exhausted");
      console.error("   - Limit: 0 (no quota allocated)");
      console.error("");
      console.error("💡 SOLUTIONS:");
      console.error("   1. Wait 20-60 minutes for quota reset");
      console.error("   2. Check billing: https://aistudio.google.com/billing");
      console.error("   3. Create new API key: https://aistudio.google.com/apikey");
      console.error("   4. Enable billing for higher limits");
    } else if (errorMessage.includes("API_KEY") || errorMessage.includes("401")) {
      console.error("🚫 INVALID API KEY:");
      console.error("   - The API key is not valid");
      console.error("   - Check if key is correct in .env.local");
      console.error("");
      console.error("💡 SOLUTION:");
      console.error("   1. Get new key: https://aistudio.google.com/apikey");
      console.error("   2. Update .env.local with new key");
      console.error("   3. Restart dev server");
    } else {
      console.error("❌ Error:", errorMessage);
      console.error("");
      console.error("Full error:", error);
    }
    
    process.exit(1);
  }
}

testAPIKey();

