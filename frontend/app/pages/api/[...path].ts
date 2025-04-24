// pages/api/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import httpProxyMiddleware from 'next-http-proxy-middleware';

// Define the backend API URL
const API_URL = process.env.BACKEND_API_URL || 'http://localhost:5001';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Forward the request to the backend API
    return httpProxyMiddleware(req, res, {
      target: API_URL,
      pathRewrite: [
        {
          patternStr: '^/api',
          replaceStr: '/api'
        }
      ],
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return res.status(500).json({ error: 'API proxy error' });
  }
}

// To avoid body parsing, we need to export the config
export const config = {
  api: {
    bodyParser: false,
    externalResolver: true
  }
};