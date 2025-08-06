'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
	const router = useRouter();
	const [search, setSearch] = useState('');
	const [location, setLocation] = useState('');
	const [user, setUser] = useState<{ name: string; role: string } | null>(null);

	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem('token');
		const userData = localStorage.getItem('user');
		if (token && userData) {
			try {
				setUser(JSON.parse(userData));
			} catch (error) {
				console.error('Error parsing user data:', error);
				localStorage.removeItem('token');
				localStorage.removeItem('user');
			}
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setUser(null);
		router.push('/');
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		// You can route to a search page or handle search logic here
		router.push(
			`/events?search=${encodeURIComponent(
				search
			)}&location=${encodeURIComponent(location)}`
		);
	};

	return (
		<nav className="w-full bg-white border-b shadow-sm px-4 md:px-8 py-2 flex items-center justify-between gap-4 sticky top-0 z-50">
			{/* Logo */}
			<Link
				href="/"
				className="flex items-center gap-2 text-xl font-bold text-primary"
			>
				<Image
					src="/logo.svg"
					alt="Logo"
					width={32}
					height={32}
					className="object-contain"
				/>
				HiburanApp
			</Link>
			{/* Search */}
			<form
				onSubmit={handleSearch}
				className="flex-1 flex items-center gap-2 max-w-xl mx-4"
			>
				<input
					type="text"
					placeholder="Search events..."
					className="border rounded-l px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Location"
					className="border-t border-b border-r rounded-r px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-primary"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
				/>
				<button
					type="submit"
					className="bg-primary text-white px-4 py-2 rounded ml-2 hover:bg-primary/90 transition"
				>
					Search
				</button>
			</form>
			{/* Auth Buttons */}
			<div className="flex items-center gap-2">
				{user ? (
					<>
						<span className="text-sm text-gray-600">Welcome, {user.name}</span>
						{user.role === 'organizer' && (
							<Link href="/dashboard">
								<button className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition">
									Dashboard
								</button>
							</Link>
						)}
						{user.role === 'customer' && (
							<Link href="/customer-dashboard">
								<button className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition">
									Dashboard
								</button>
							</Link>
						)}
						<button
							onClick={handleLogout}
							className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition"
						>
							Logout
						</button>
					</>
				) : (
					<>
						<Link href="/login">
							<button className="px-4 py-2 rounded border border-primary text-primary hover:bg-primary/10 transition">
								Login
							</button>
						</Link>
						<Link href="/register">
							<button className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition">
								Register
							</button>
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
