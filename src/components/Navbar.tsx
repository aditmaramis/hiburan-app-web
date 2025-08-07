'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
	const router = useRouter();
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

	return (
		<nav className="w-full glass shadow-2xl shadow-black/10 px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-50 backdrop-blur-md">
			{/* Logo */}
			<Link
				href="/"
				className="flex items-center gap-2 text-xl font-bold text-white hover:text-white/90 transition-colors duration-300"
			>
				<Image
					src="/logo hiburan.png"
					alt="Logo"
					width={100}
					height={100}
					className="object-contain filter brightness-0 invert"
				/>
			</Link>

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
							<button className="px-4 py-2 rounded text-white hover:bg-white/10 transition-all duration-300 text-sm backdrop-blur-sm">
								Login
							</button>
						</Link>
						<Link href="/register">
							<button className="px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white transition-all duration-300 text-sm font-medium backdrop-blur-sm hover:border-white/30">
								Register
							</button>
						</Link>
					</>
				)}
			</div>
		</nav>
	);
}
