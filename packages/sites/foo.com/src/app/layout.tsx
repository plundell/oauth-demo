import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "#components/navbar";
import { AuthProvider } from '#context/AuthContext';

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Foo.com",
	description: "OAuth demo website no.2",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			{/* palun: add a custom watcher for cookie changes */}
			{/* <head>
				<script src="/cookieChangeWatcher.js"></script>
			</head> */}
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/* palun: wrap the app in the AuthProvider so we can login/logout and check if user is authenticated */}
				<AuthProvider>
					<Navbar />
					{children}
				</AuthProvider>
			</body>
		</html>
	);
}
