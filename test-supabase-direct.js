// Direct test of Supabase connection from Node.js
// This bypasses Next.js to test if RLS policies work directly

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
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

const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\n🔍 Testing Supabase Contact Submission...\n');
console.log('URL:', url?.substring(0, 40) + '...');
console.log('Anon Key:', anonKey ? 'Present (' + anonKey.substring(0, 20) + '...)' : 'MISSING');

async function testInsert() {
  const supabase = createClient(url, anonKey);
  
  console.log('\n📝 Attempting to insert test record...\n');
  
  const testData = {
    name: 'Direct Test User',
    email: 'directtest@example.com',
    subject: 'demo',
    message: 'Testing direct Supabase insert bypassing Next.js',
    status: 'new'
  };
  
  const { data, error } = await supabase
    .from('contact_submissions')
    .insert(testData)
    .select()
    .single();
  
  if (error) {
    console.log('❌ INSERT FAILED');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('Error Details:', error.details);
    console.log('Error Hint:', error.hint);
    
    // Check if it's RLS error
    if (error.code === '42501') {
      console.log('\n🔴 This is an RLS policy violation!');
      console.log('   The anon key is NOT allowed to insert by RLS policies.');
      console.log('   Even though we set the policies in Supabase, they might not be active.');
    }
  } else {
    console.log('✅ INSERT SUCCESSFUL!');
    console.log('Inserted record ID:', data.id);
    console.log('Data:', JSON.stringify(data, null, 2));
  }
}

testInsert().catch(err => {
  console.error('Fatal error:', err);
});

