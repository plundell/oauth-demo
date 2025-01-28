'use client';

import { useAuthContext } from '#context/AuthContext';
import { useEffect, useState, Suspense } from 'react';

interface Expenditure {
	date: string;
	description: string;
	amount: number;
	category: string;
}

// Placeholder component for loading state
function PlaceholderTable() {
	return (
		<table className="min-w-full bg-pink-900 border border-pink-700">
			<thead>
				<tr className="bg-pink-800">
					<th className="px-6 py-3 border-b text-left text-white">Date</th>
					<th className="px-6 py-3 border-b text-left text-white">Description</th>
					<th className="px-6 py-3 border-b text-left text-white">Category</th>
					<th className="px-6 py-3 border-b text-right text-white">Amount</th>
				</tr>
			</thead>
			<tbody>
				{Array.from({ length: 3 }).map((_, index) => (
					<tr key={index} className="hover:bg-pink-700">
						<td className="px-6 py-4 border-b bg-pink-700">&nbsp;</td>
						<td className="px-6 py-4 border-b bg-pink-700">&nbsp;</td>
						<td className="px-6 py-4 border-b bg-pink-700">&nbsp;</td>
						<td className="px-6 py-4 border-b text-right bg-pink-700">&nbsp;</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}

// Main component function
export default function AccountPage() {
	// Use the useAuthContext hook to get authentication status
	const { isAuthenticated } = useAuthContext();
	const [expenditures, setExpenditures] = useState<Expenditure[]>([]);

	useEffect(() => {
		// Fetch data from the /api/account-data endpoint
		const fetchExpenditures = async () => {
			try {
				const response = await fetch('/api/account-data');
				if (!response.ok) {
					throw new Error('Failed to fetch data');
				}
				const data = await response.json();
				setExpenditures(data.expenditures);
			} catch (error) {
				console.error('Error fetching expenditures:', error);
			}
		};

		if (isAuthenticated) {
			fetchExpenditures();
		}
	}, [isAuthenticated]);

	return (
		<div className="p-8 relative">
			<h1 className="text-3xl font-bold mb-6">Your Account</h1>

			<div className="overflow-x-auto">
				<Suspense fallback={<PlaceholderTable />}>
					{isAuthenticated ? (
						<table className="min-w-full bg-pink-900 border border-pink-700">
							<thead>
								<tr className="bg-pink-800">
									<th className="px-6 py-3 border-b text-left text-white">Date</th>
									<th className="px-6 py-3 border-b text-left text-white">Description</th>
									<th className="px-6 py-3 border-b text-left text-white">Category</th>
									<th className="px-6 py-3 border-b text-right text-white">Amount</th>
								</tr>
							</thead>
							<tbody>
								{expenditures.map((item, index) => (
									<tr key={index} className="hover:bg-pink-700">
										<td className="px-6 py-4 border-b text-white">{item.date}</td>
										<td className="px-6 py-4 border-b text-white">{item.description}</td>
										<td className="px-6 py-4 border-b text-white">{item.category}</td>
										<td className="px-6 py-4 border-b text-right text-white">
											${item.amount.toFixed(2)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<PlaceholderTable />
					)}
				</Suspense>
			</div>
		</div>
	);
}
