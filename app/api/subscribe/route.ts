import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const response = await fetch(`https://chemacabezadev.substack.com/api/v1/free`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Referer': 'https://chemacabezadev.substack.com/',
      },
      body: JSON.stringify({ 
        email: email,
        referrer: 'https://chemacabeza.dev/',
        source: 'custom_form'
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Substack API error response:", errorText);
        throw new Error(`Substack subscription failed: ${response.status} ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Newsletter subscription error:", error.message);
    return NextResponse.json({ error: error.message || 'Failed to subscribe' }, { status: 500 });
  }
}
