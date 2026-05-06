import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://xonkfaybccwruiavqxvr.supabase.co";

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbmtmYXliY2N3cnVpYXZxeHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwOTg2OTEsImV4cCI6MjA5MzY3NDY5MX0.I980bCbIBCBXeUUbLwJKyLKU_0sxRdCDwCl8Gw37Gew";

const EVENT_SLUG = "main-event";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
