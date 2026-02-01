import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://orhaxhsuebtzbxwqmugm.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaGF4aHN1ZWJ0emJ4d3FtdWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4Nzk4OTcsImV4cCI6MjA4NTQ1NTg5N30.vMtw8LfIgeVedB_B5NsbtYzFBMo0k9gQEhMyLgYzn2E'

export const supabase = createClient(supabaseUrl, supabaseKey)
