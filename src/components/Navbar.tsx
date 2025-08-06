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
		<nav className="w-full glass border-b border-white/20 shadow-2xl shadow-black/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md">
			{/* Logo */}
			<Link
				href="/"
				className="flex items-center gap-2 text-xl font-bold text-white hover:text-white/90 transition-colors duration-300"
			>
				<Image
					src="/logo.svg"
					alt="Logo"
					width={32}
					height={32}
					className="h-8 w-8 object-contain filter brightness-0 invert"
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
					className="glass border-none rounded-l px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/70 text-sm"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<input
					type="text"
					placeholder="Location"
					className="glass border-none rounded-r px-3 py-2 w-32 focus:outline-none focus:ring-2 focus:ring-white/30 text-white placeholder:text-white/70 text-sm"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
				/>
				<button
					type="submit"
					className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded ml-2 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20 hover:border-white/30 text-sm font-medium"
				>
					Search
				</button>
			</form>
			{/* Auth Buttons */}
			<div className="flex items-center gap-2">
				{user ? (
					<>
						<span className="text-sm text-white/80">Welcome, {user.name}</span>
						{user.role === 'organizer' && (
							<Link href="/dashboard">
								<button className="px-4 py-2 rounded border border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm">
									Dashboard
								</button>
							</Link>
						)}
						{user.role === 'customer' && (
							<Link href="/customer-dashboard">
								<button className="px-4 py-2 rounded border border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm">
									Dashboard
								</button>
							</Link>
						)}
						<button
							onClick={handleLogout}
							className="px-4 py-2 rounded bg-red-500/80 hover:bg-red-500 text-white transition-all duration-300 backdrop-blur-sm text-sm font-medium"
						>
							Logout
						</button>
					</>
				) : (
					<>
						<Link href="/login">
							<button className="px-4 py-2 rounded border border-white/30 text-white hover:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm">
								Login
							</button>
						</Link>
						<Link href="/register">
							<button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white transition-all duration-300 text-sm font-medium backdrop-blur-sm border border-white/20 hover:border-white/30">
								Register
							</button>
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
