// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// !! IMPORTANT:
// 1. Find your 'Project URL' in your Supabase project settings (API section)
// 2. Find your 'anon public' key in your Supabase project settings (API section)

const supabaseUrl = 'https://nxwuqqmkpqldfpzatojv.supabase.co';    // Replace with your URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54d3VxcW1rcHFsZGZwemF0b2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzA5NTMsImV4cCI6MjA3ODgwNjk1M30.qJi51DDxR5JeCXUsZi1HOLnsDLW7yAPi2Wo9Wkj_L_c';

// This creates the 'client' that we will use to talk to Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)