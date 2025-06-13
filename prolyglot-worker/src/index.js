import { GoogleGenerativeAI } from '@google/generative-ai';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
	async fetch(request, env, ctx) {
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', {
				status: 405,
			});
		}

		try {
			const { text, language } = await request.json();

			if (!text || !language) {
				return new Response('Missing text or language in request body', {
					status: 400,
				});
			}

			const API_KEY = env.GOOGLE_GEMINI_API_KEY; // Get API key from environment variables

			if (!API_KEY) {
				return new Response('Server configuration error: API key not set', {
					status: 500,
				});
			}

			const genAI = new GoogleGenerativeAI(API_KEY);
			const model = genAI.getGenerativeModel(
				{
					model: 'gemini-1.5-flash',
				},
				{
					baseUrl: `https://gateway.ai.cloudflare.com/v1/75ffbe00406789f27fabe05edc8d24af/prolyglot/google-ai-studio`,
				}
			);

			const prompt = `Translate the following English text to ${language}:\n\n"${text}". give only the translated text without any additional information.`;

			const result = await model.generateContent(prompt);
			const response = await result.response;
			const translatedText = response.text();

			return new Response(
				JSON.stringify({
					translatedText,
				}),
				{
					headers: corsHeaders,
				}
			);
		} catch (error) {
			console.error('Error in worker:', error);
			return new Response(
				JSON.stringify({
					error: 'Translation failed',
				}),
				{
					status: 500,
					headers: corsHeaders,
				}
			);
		}
	},
};
