"use client";
import { ReactNode } from 'react';
import { useAuthContext } from '#context/AuthContext'; // Adjust the path as necessary
import PrivacyScreen from '#components/privacy-screen';

interface LoggedInLayoutProps {
	children: ReactNode;
}

export default function LoggedInLayout({ children }: LoggedInLayoutProps) {
	const { isAuthenticated, login } = useAuthContext();

	return (
		<div className="relative">
			<main className="main-content">
				{children}
				{!isAuthenticated && <PrivacyScreen login={login} />}
			</main>
		</div>
	);
} 