import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const createClient = () =>
  createBrowserClient(supabaseUrl!, supabaseKey!);
