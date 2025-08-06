import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
	process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ||
	'http://localhost:8000';

export async function POST(
	request: NextRequest,
	{ params }: { params: { bookingId: string } }
) {
	try {
		const { bookingId } = params;

		// Get the authorization header from the request
		const authorization = request.headers.get('authorization');

		if (!authorization) {
			return NextResponse.json(
				{ message: 'Authorization header required' },
				{ status: 401 }
			);
		}

		// Get the form data from the request
		const formData = await request.formData();

		// Forward the request to the backend
		const backendResponse = await fetch(
			`${BACKEND_URL}/api/v1/enhanced/bookings/${bookingId}/payment-proof`,
			{
				method: 'POST',
				headers: {
					Authorization: authorization,
				},
				body: formData,
			}
		);

		if (!backendResponse.ok) {
			const errorText = await backendResponse.text();
			console.error('Backend error:', backendResponse.status, errorText);

			// Try to parse as JSON, fallback to text
			let errorData;
			try {
				errorData = JSON.parse(errorText);
			} catch {
				errorData = { message: errorText || 'Backend server error' };
			}

			return NextResponse.json(errorData, { status: backendResponse.status });
		}

		const responseData = await backendResponse.json();
		return NextResponse.json(responseData);
	} catch (error) {
		console.error('Payment proof upload proxy error:', error);

		// Check if it's a connection error
		if (error instanceof TypeError && error.message.includes('fetch')) {
			return NextResponse.json(
				{
					message:
						'Backend server is not available. Please ensure the backend server is running on port 8000.',
					details: 'Connection refused to backend server',
				},
				{ status: 503 }
			);
		}

		return NextResponse.json(
			{
				message: 'Internal server error',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}
