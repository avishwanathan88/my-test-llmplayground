# Deploying LLM Playground to Vercel

This guide will help you deploy your LLM Playground to Vercel with all the necessary configurations.

## Prerequisites

1. A [Vercel account](https://vercel.com)
2. [Vercel CLI](https://vercel.com/cli) installed (optional but recommended)
3. API keys for the LLM providers you want to use

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect your repository to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub/GitLab repository
   - Vercel will automatically detect the project settings

2. **Configure Environment Variables:**
   In the Vercel dashboard, go to your project settings and add these environment variables:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   GOOGLE_API_KEY=your_google_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   HF_TOKEN=your_huggingface_token_here
   ```

   **Note:** You only need to add the API keys for the providers you plan to use.

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

4. **Add environment variables:**
   ```bash
   vercel env add OPENAI_API_KEY
   vercel env add ANTHROPIC_API_KEY
   vercel env add GOOGLE_API_KEY
   vercel env add GROQ_API_KEY
   vercel env add HF_TOKEN
   ```

5. **Redeploy with environment variables:**
   ```bash
   vercel --prod
   ```

## Getting API Keys

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