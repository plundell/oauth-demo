export default function PrivacyScreen({ login }: { login: () => void }) {
	return (
		<div className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
				<h2 className="text-2xl font-bold mb-4">Please Log In</h2>
				<p className="mb-6">
					You need to be logged in to view this content.
				</p>
				<button
					className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
					onClick={login}
				>
					Log In
				</button>
			</div>
		</div>
	);
}