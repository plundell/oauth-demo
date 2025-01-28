import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route handler for account expenditure data
 * Implements authentication check via JWT cookie and returns mock financial data
 * 
 * @route GET /api/account-data
 * @returns {Promise<NextResponse>} JSON response with expenditure data or 401 error
 */
export async function GET(): Promise<NextResponse> {
	// Get cookie store and check for JWT
	const cookieStore = await cookies();
	const jwtCookie = cookieStore.get('jwt');

	// Return 401 if no JWT cookie found
	if (!jwtCookie) {
		return NextResponse.json(
			{ error: 'Unauthorized - No valid session found' },
			{ status: 401 }
		);
	}

	//TODO: actually check if the JWT is valid


	// Return mock data with success status
	return NextResponse.json(generateMockData(), { status: 200 });
}




function generateMockData() {
	// Categories and descriptions for generating random data
	const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Shopping'];
	const descriptions = {
		Food: ['Grocery Shopping', 'Restaurant', 'Coffee Shop', 'Food Delivery'],
		Transportation: ['Gas Station', 'Public Transit', 'Uber Ride', 'Car Maintenance'],
		Entertainment: ['Netflix Subscription', 'Movie Tickets', 'Concert Tickets', 'Gaming'],
		Utilities: ['Electricity Bill', 'Water Bill', 'Internet Bill', 'Phone Bill'],
		Shopping: ['Clothing Store', 'Electronics', 'Home Goods', 'Online Shopping']
	};

	// Generate 3-7 random transactions
	const numTransactions = Math.floor(Math.random() * 5) + 3;
	const transactions = [];

	for (let i = 0; i < numTransactions; i++) {
		// Generate random date within last 30 days
		const date = new Date();
		date.setDate(date.getDate() - Math.floor(Math.random() * 30));

		// Select random category and description
		const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof descriptions;
		const description = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];

		// Generate random amount between 1 and 500
		const amount = Number((Math.random() * 499 + 1).toFixed(2));

		transactions.push({
			date: date.toISOString().split('T')[0],
			description,
			amount,
			category
		});
	}

	// Sort transactions by date descending
	transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return {
		expenditures: transactions
	};
}