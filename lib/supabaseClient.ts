// Read from Vite's environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

try {
  const testUrl = new URL(supabaseUrl);
  console.log('Parsed URL object:', testUrl);
} catch (err) {
  console.error('URL parsing error:', err);
}

import { createClient } from '@supabase/supabase-js';
import { Database } from '../database.types';

// Check for missing configuration
if (!supabaseUrl || !supabaseKey || 
    supabaseUrl.includes('YOUR_SUPABASE_URL') || 
    supabaseKey.includes('YOUR_SUPABASE_ANON_KEY')) {

  const errorContainer = document.getElementById('root');
  if (errorContainer) {
    errorContainer.innerHTML = `
      <div class="h-screen w-screen flex items-center justify-center bg-dark-900 text-dark-text p-8">
        <div class="max-w-2xl bg-dark-800 p-8 rounded-lg shadow-lg border border-red-500/50">
          <h1 class="text-2xl font-bold text-red-400">Configuration Error</h1>
          <p class="mt-4 text-dark-text-secondary">The application is not configured to connect to Supabase.</p>
          <p class="mt-2 text-dark-text-secondary">Please create a <code class="bg-dark-900 px-2 py-1 rounded text-yellow-400">.env</code> file in your project root and add your Supabase Project URL and Public Anon Key.</p>
          <p class="mt-4 text-sm text-dark-text-secondary">Example:</p>
          <pre class="mt-2 text-sm text-yellow-400 bg-dark-900 p-4 rounded">
VITE_SUPABASE_URL=https://YOUR_SUPABASE_URL.supabase.co
VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
          </pre>
        </div>
      </div>
    `;
  }

  throw new Error("Please create a .env file with your Supabase credentials.");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
