const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Gets or creates a user by phone number and returns a session/token.
 * @param {string} phone - The verified phone number.
 */
const getOrCreateUserByPhone = async (phone) => {
  try {
    // 1. Check if user exists
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    // Supabase phone format is usually E.164, match carefully
    let user = users.users.find(u => u.phone === phone);
    const email = `${phone.replace('+', '')}@phone.kizola.com`;

    if (!user) {
      // 2. Create user if not exists
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: phone,
        email: email, // Associate an email for magiclink exchange
        email_confirm: true,
        phone_confirm: true,
        user_metadata: {
          full_name: 'Phone User',
          role: 'user'
        }
      });

      if (createError) throw createError;
      user = newUser.user;
    }

    // 3. Generate a magiclink token to exchange for a session on the frontend
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email
    });

    if (linkError) throw linkError;

    // Return the token_hash which the frontend can use with verifyOtp
    return { 
      user, 
      session_token: linkData.properties.token_hash 
    };
  } catch (error) {
    console.error('Supabase Service Error:', error);
    throw error;
  }
};

module.exports = {
  getOrCreateUserByPhone,
  supabase,
};
