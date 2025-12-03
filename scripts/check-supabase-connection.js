// Quick script to check Supabase connection
// Run with: node scripts/check-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
let envVars = {};
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });
} catch (err) {
  console.log('⚠️  Could not read .env.local file');
}

async function checkConnection() {
  console.log('\n🔍 Checking Supabase Connection...\n');

  // Check environment variables
  const url = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Environment Variables:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', url ? `${url.substring(0, 40)}...` : '❌ MISSING');
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? '✅ Present' : '❌ MISSING');

  if (!url || !anonKey) {
    console.log('\n❌ Error: Missing Supabase credentials in .env.local\n');
    console.log('Please ensure your .env.local file has:');
    console.log('  NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key');
    return;
  }

  // Try to connect
  console.log('\n📡 Testing connection...');
  const supabase = createClient(url, anonKey);

  try {
    // Try a simple query
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('\n⚠️  Connection successful but table missing');
        console.log('   The contact_submissions table does not exist.');
        console.log('   Please run: supabase/RUN_CONTACT_MIGRATION.sql');
      } else if (error.message.includes('fetch failed')) {
        console.log('\n❌ Connection failed - Network error');
        console.log('   Error:', error.message);
        console.log('\n   Possible causes:');
        console.log('   1. Wrong Supabase URL');
        console.log('   2. Network/Firewall blocking connection');
        console.log('   3. Supabase project is paused/deleted');
      } else {
        console.log('\n❌ Database error:', error.message);
        console.log('   Code:', error.code);
      }
    } else {
      console.log('✅ Connection successful!');
      console.log('✅ Table exists!');
      console.log(`   Found ${data?.length || 0} records`);
    }
  } catch (error) {
    console.log('\n❌ Connection failed - Fetch error');
    console.log('   Error:', error.message);
    console.log('\n   This usually means:');
    console.log('   1. The Supabase URL is incorrect');
    console.log('   2. Network connectivity issue');
    console.log('   3. Firewall/VPN blocking the connection');
  }

  console.log('\n');
}

checkConnection();

