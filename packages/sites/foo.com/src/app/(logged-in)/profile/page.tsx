'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface UserProfile {
	name: string;
	email: string;
	pictureUrl: string;
}

// Placeholder component for loading state
function PlaceholderProfile() {
	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold mb-6">Profile</h1>
			<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
				<div className="flex flex-col items-center mb-6">
					<div className="relative w-32 h-32 rounded-full overflow-hidden mb-4 bg-gray-200">&nbsp;</div>
					<h2 className="text-2xl font-semibold bg-gray-200 w-24">&nbsp;</h2>
					<p className="text-gray-600 bg-gray-200 w-40">&nbsp;</p>
				</div>
				<div className="border-t pt-6">
					<button
						className="w-full bg-gray-200 py-2 px-4 rounded"
					>&nbsp;
					</button>
				</div>
			</div>
		</div>
	);
}

// Main component function
export default function ProfilePage() {
	const [hasJwt, setHasJwt] = useState(false);
	const [profile] = useState<UserProfile>({
		name: 'John Doe',
		email: 'john.doe@example.com',
		pictureUrl: '/placeholder-profile.jpg'
	});

	useEffect(() => {
		const cookies = document.cookie.split(';');
		const hasJwtCookie = cookies.some(cookie =>
			cookie.trim().startsWith('jwt=')
		);
		setHasJwt(hasJwtCookie);
	}, []);

	return (
		<div className="p-8 relative">
			{hasJwt ? (
				<div>
					<h1 className="text-3xl font-bold mb-6">Profile</h1>
					<div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
						<div className="flex flex-col items-center mb-6">
							<div className="relative w-32 h-32 rounded-full overflow-hidden mb-4">
								<Image
									src={profile.pictureUrl}
									alt="Profile picture"
									fill
									className="object-cover"
								/>
							</div>
							<h2 className="text-2xl font-semibold">{profile.name}</h2>
							<p className="text-gray-600">{profile.email}</p>
						</div>
						<div className="border-t pt-6">
							<button
								className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
								onClick={() => {
									// Handle edit profile
									console.log('Edit profile clicked');
								}}
							>
								Edit Profile
							</button>
						</div>
					</div>
				</div>
			) : (
				<>
					<PlaceholderProfile />
				</>
			)}
		</div>
	);
}
