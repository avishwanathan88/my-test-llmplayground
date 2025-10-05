# Deploying LLM Playground to Vercel

This guide will help you deploy your LLM Playground to Vercel with the new mandatory user API key system.

## 🔒 **Important Security Update**

This application now uses a **mandatory user API key system** for enhanced security:
- **No server-side API keys** are stored or used
- **Users must provide their own API keys** during first-time setup
- **API keys are stored locally** in the user's browser using localStorage
- **Complete cost control** - users are charged directly by AI providers

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. [Vercel CLI](https://vercel.com/cli) installed (optional but recommended)
3. **No API keys needed for deployment** - users will provide their own

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub/GitLab repository
   - Vercel will automatically detect the project settings

2. **No Environment Variables Required:**
   Since the application now uses mandatory user-provided API keys, you don't need to configure any environment variables for API keys.

3. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from your project directory:**
   ```bash
   vercel
   ```

4. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## User Experience After Deployment

### First-Time Users
1. **Mandatory Setup:** Users will see a setup modal requiring API key configuration
2. **One-Time Process:** Keys are stored locally and persist across sessions
3. **Provider Choice:** Users can configure keys for any combination of providers
4. **Secure Storage:** Keys never leave the user's browser

### Returning Users
1. **Automatic Loading:** Previously configured keys are loaded automatically
2. **Settings Management:** Users can update keys via the settings button (⚙️)
3. **Full Control:** Users can add, update, or clear their stored keys anytime

## How Users Get API Keys

### OpenAI
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/login and go to API Keys
3. Create a new secret key

### Anthropic (Claude)
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/login and go to API Keys
3. Create a new API key

### Google (Gemini)
1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign up/login and click "Get API Key"
3. Create a new API key

### Groq
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up/login and go to API Keys
3. Create a new API key

### Hugging Face
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up/login and go to Settings > Access Tokens
3. Create a new token with "Read" permissions

## Project Structure

The project has been configured for Vercel deployment with:

- `vercel.json` - Vercel configuration file
- `api/` directory - Serverless functions for API endpoints
  - `api/chat.js` - Main chat API endpoint
  - `api/health.js` - Health check endpoint
- Static files served from the root directory

## Verification

After deployment:

1. Visit your Vercel URL
2. Check that the health endpoint works: `https://your-app.vercel.app/api/health`
3. Test the chat functionality with different models
4. Verify that all your configured API providers are working

## Troubleshooting

### Common Issues:

1. **"API key not configured" errors:**
   - Ensure environment variables are set correctly in Vercel dashboard
   - Redeploy after adding environment variables

2. **Function timeout errors:**
   - API calls are limited to 30 seconds on Vercel
   - This should be sufficient for most LLM responses

3. **CORS errors:**
   - The API functions include CORS headers
   - If issues persist, check browser console for specific errors

### Checking Logs:

- View function logs in the Vercel dashboard under "Functions" tab
- Use `vercel logs` command if using CLI

## Security Notes

- Environment variables are encrypted and secure in Vercel
- API keys are never exposed to the client-side code
- All API calls are proxied through Vercel serverless functions

## Support

If you encounter issues:
1. Check the Vercel function logs
2. Verify your API keys are valid and have sufficient credits
3. Test the health endpoint to see which providers are configured

Your LLM Playground should now be successfully deployed on Vercel! 🚀