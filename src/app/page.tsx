'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import EventListHome from '../components/EventListHome';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function Home() {
	const [searchQuery, setSearchQuery] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [dateFilter, setDateFilter] = useState('');

	const categories = [
		{ value: 'all', label: 'All Events' },
		{ value: 'Music', label: 'Music' },
		{ value: 'Sports', label: 'Sports' },
		{ value: 'Technology', label: 'Technology' },
		{ value: 'Food & Drink', label: 'Food & Drink' },
		{ value: 'Art & Culture', label: 'Art & Culture' },
		{ value: 'Business', label: 'Business' },
		{ value: 'Education', label: 'Education' },
	];

	const handleSearch = () => {
		// The filtering will be handled by EventListHome component
		// This function can be used for additional search actions if needed
	};

	const handleCategoryClick = (category: string) => {
		setSelectedCategory(category);
		setDateFilter(''); // Clear date filter when category changes
	};

	const handleDateFilterClick = (filter: string) => {
		setDateFilter(filter === dateFilter ? '' : filter); // Toggle filter
	};
	return (
		<>
			{/* Full screen background image */}
			<div className="fixed inset-0 z-0">
				<Image
					src="/concert.jpg"
					alt="Home background"
					fill
					className="object-cover filter brightness-90"
					priority
				/>
				{/* Dark overlay for better readability */}
				<div className="absolute inset-0 bg-black/30" />
				{/* Subtle glass overlay */}
				<div className="absolute inset-0 backdrop-blur-sm bg-black/10" />
			</div>

			{/* Very light animated gradient overlay */}
			<div className="fixed inset-0 z-10 bg-gradient-to-br from-slate-900/20 via-orange-900/10 to-amber-900/20 animate-gradient-shift" />

			{/* Floating geometric elements */}
			<div className="fixed top-10 left-10 w-16 h-16 border border-orange-400/20 rounded-full animate-float z-10" />
			<div
				className="fixed top-1/3 right-20 w-12 h-12 border border-amber-400/15 rounded-lg rotate-45 animate-float z-10"
				style={{ animationDelay: '2s' }}
			/>
			<div
				className="fixed bottom-20 left-1/4 w-10 h-10 border border-yellow-400/15 rounded-full animate-float z-10"
				style={{ animationDelay: '4s' }}
			/>

			{/* Content with higher z-index */}
			<div className="relative z-20">
				<Navbar />
				<main className="min-h-screen">
					{/* Hero Section */}
					<section className="py-20 relative">
						<div className="absolute inset-0 glass-dark rounded-none" />
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
							<h1 className="text-4xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
								Discover Amazing Events
							</h1>
							<p className="text-xl md:text-2xl mb-8 text-white/90 drop-shadow-md">
								Find and book tickets for concerts, workshops, conferences, and
								more
							</p>

							{/* Enhanced Search Section */}
							<div className="max-w-4xl mx-auto space-y-6">
								{/* Main Search Bar */}
								<div className="flex flex-col lg:flex-row gap-4 justify-center">
									<input
										type="text"
										placeholder="Search events..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										className="flex-1 px-6 py-4 rounded-lg glass text-white placeholder:text-white/70 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30 text-lg"
									/>
									<input
										type="text"
										placeholder="Location (city, venue)..."
										value={locationQuery}
										onChange={(e) => setLocationQuery(e.target.value)}
										className="lg:w-80 px-6 py-4 rounded-lg glass text-white placeholder:text-white/70 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30 text-lg"
									/>
									<button
										onClick={handleSearch}
										className="bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/25 backdrop-blur-sm border border-white/20 hover:border-white/30"
									>
										Search Events
									</button>
								</div>

								{/* Category Filter Pills */}
								<div className="flex flex-wrap gap-3 justify-center">
									{categories.map((category) => (
										<button
											key={category.value}
											onClick={() => handleCategoryClick(category.value)}
											className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
												selectedCategory === category.value
													? 'bg-white/20 text-white border-white/30 shadow-lg'
													: 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20 hover:text-white'
											}`}
										>
											{category.label}
										</button>
									))}
								</div>

								{/* Quick Filter Options */}
								<div className="flex flex-wrap gap-3 justify-center text-sm">
									<button
										onClick={() => handleDateFilterClick('weekend')}
										className={`px-3 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
											dateFilter === 'weekend'
												? 'border-white/30 text-white bg-white/20'
												: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
										}`}
									>
										This Weekend
									</button>
									<button
										onClick={() => handleDateFilterClick('nextweek')}
										className={`px-3 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
											dateFilter === 'nextweek'
												? 'border-white/30 text-white bg-white/20'
												: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
										}`}
									>
										Next Week
									</button>
									<button
										onClick={() => handleDateFilterClick('free')}
										className={`px-3 py-1 rounded-full backdrop-blur-sm border transition-all duration-300 ${
											dateFilter === 'free'
												? 'border-white/30 text-white bg-white/20'
												: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
										}`}
									>
										Free Events
									</button>
									<button className="px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300">
										Near Me
									</button>
								</div>
							</div>
						</div>
					</section>

					{/* Events Section */}
					<section className="py-16 relative">
						<div className="absolute inset-0 glass rounded-none" />
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="text-center mb-12">
								<h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
									Upcoming Events
								</h2>
								<p className="text-lg text-white/80 drop-shadow-md">
									Discover events happening near you
								</p>
							</div>

							<EventListHome
								searchQuery={searchQuery}
								locationQuery={locationQuery}
								categoryFilter={selectedCategory}
								dateFilter={dateFilter}
							/>
						</div>
					</section>

					{/* Features Section */}
					<section className="py-16 relative">
						<div className="absolute inset-0 glass-dark rounded-none" />
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="text-center mb-12">
								<h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
									Why Choose HiburanApp?
								</h2>
							</div>

							<div className="grid md:grid-cols-3 gap-8">
								<div className="text-center glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
									<div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
										<svg
											className="w-8 h-8 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-white">
										Easy Booking
									</h3>
									<p className="text-white/80">
										Book tickets in just a few clicks with our simple and secure
										process.
									</p>
								</div>

								<div className="text-center glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
									<div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
										<svg
											className="w-8 h-8 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-white">
										Local Events
									</h3>
									<p className="text-white/80">
										Discover events happening in your city and nearby locations.
									</p>
								</div>

								<div className="text-center glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
									<div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
										<svg
											className="w-8 h-8 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
											/>
										</svg>
									</div>
									<h3 className="text-xl font-semibold mb-2 text-white">
										Secure & Reliable
									</h3>
									<p className="text-white/80">
										Your payments are secure and your tickets are guaranteed.
									</p>
								</div>
							</div>
						</div>
					</section>
				</main>
				<Footer />
			</div>
		</>
	);
}
