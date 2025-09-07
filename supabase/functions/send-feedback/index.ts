import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackRequest {
  message: string;
  type: 'bug' | 'improvement';
  url: string;
  userAgent: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, type, url, userAgent }: FeedbackRequest = await req.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Discord embed
    const embed = {
      title: type === 'bug' ? '🐛 Nouveau rapport de bug' : '💡 Nouvelle suggestion',
      description: message,
      color: type === 'bug' ? 0xed4245 : 0xfee75c,
      fields: [
        {
          name: 'URL',
          value: url,
          inline: true
        },
        {
          name: 'Type',
          value: type === 'bug' ? 'Bug Report' : 'Amélioration',
          inline: true
        }
      ],
      footer: {
        text: `User Agent: ${userAgent}`
      },
      timestamp: new Date().toISOString()
    };

    // Send to Discord
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed]
      }),
    });

    if (!discordResponse.ok) {
      console.error('Discord webhook failed:', await discordResponse.text());
      throw new Error('Failed to send to Discord');
    }

    console.log('Feedback sent successfully:', { type, url });

    return new Response(
      JSON.stringify({ success: true, message: 'Feedback sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-feedback function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});