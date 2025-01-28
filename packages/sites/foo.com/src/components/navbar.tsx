'use client';
import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "#context/AuthContext";

export default function Navbar() {
	const { isAuthenticated, login, logout } = useAuthContext();
	const [isOpen, setIsOpen] = useState(false);

	return (
		<nav className="bg-gray-800 w-full h-16 flex items-center justify-between z-60">
			<div className="flex space-x-4">
				<Link href="/"
					className="text-white px-3 py-2 rounded-md text-sm font-medium">Home
				</Link>
				<Link href="/about"
					className="text-white px-3 py-2 rounded-md text-sm font-medium">About
				</Link>
				<Link
					href="/account"
					className={`px-3 py-2 rounded-md text-sm font-medium ${isAuthenticated ? "text-white" : "text-gray-500"
						}`}
				>
					Account
				</Link>
			</div>
			<div className="relative">
				<button
					className="text-white px-3 py-2 rounded-md text-sm font-medium"
					onClick={() => setIsOpen(!isOpen)}
				>
					<span className="material-icons">menu</span>
				</button>
				{isOpen && (
					<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
						{isAuthenticated && (
							<Link href="/profile"
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								onClick={() => setIsOpen(false)}
							>Profile
							</Link>
						)}
						{!isAuthenticated ? (
							<button
								className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								onClick={() => {
									login();
									setIsOpen(false);
								}}
							>Log in
							</button>
						) : (
							<button
								className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
								onClick={() => {
									logout();
									setIsOpen(false);
								}}
							>Log out
							</button>
						)}
					</div>
				)}
			</div>
		</nav>
	);
}
