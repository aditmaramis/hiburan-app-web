'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import EventListHome from '../components/EventListHome';
import EventCarousel from '@/components/EventCarousel';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function Home() {
	const [searchQuery, setSearchQuery] = useState('');
	const [locationQuery, setLocationQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [dateFilter, setDateFilter] = useState('');
	const eventsRef = useRef<HTMLElement>(null);

	const categories = [
		{
			value: 'all',
			label: 'All Events',
			color: 'from-white/20 to-white/10 border-white/30',
		},
		{
			value: 'Music',
			label: 'Music',
			color: 'from-purple-500/30 to-pink-500/20 border-purple-400/40',
		},
		{
			value: 'Sports',
			label: 'Sports',
			color: 'from-green-500/30 to-emerald-500/20 border-green-400/40',
		},
		{
			value: 'Technology',
			label: 'Technology',
			color: 'from-blue-500/30 to-cyan-500/20 border-blue-400/40',
		},
		{
			value: 'Food & Drink',
			label: 'Food & Drink',
			color: 'from-orange-500/30 to-red-500/20 border-orange-400/40',
		},
		{
			value: 'Art & Culture',
			label: 'Art & Culture',
			color: 'from-indigo-500/30 to-purple-500/20 border-indigo-400/40',
		},
		{
			value: 'Business',
			label: 'Business',
			color: 'from-gray-500/30 to-slate-500/20 border-gray-400/40',
		},
		{
			value: 'Education',
			label: 'Education',
			color: 'from-yellow-500/30 to-amber-500/20 border-yellow-400/40',
		},
	];

	const handleSearch = () => {
		// Scroll to events section
		if (eventsRef.current) {
			eventsRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
			});
		}
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
					{/* Hero Section with Two-Column Layout */}
					<section className="py-12 relative">
						<div className="absolute inset-0 rounded-none" />
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							{/* Main Title */}
							<div className="text-center mb-8">
								<h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
									Discover Amazing Events
								</h1>
								<p className="text-lg md:text-xl mb-6 text-white/90 drop-shadow-md">
									Find and book tickets for concerts, workshops, conferences,
									and more
								</p>
							</div>

							{/* Two-Column Layout */}
							<div className="grid lg:grid-cols-2 gap-6 items-stretch">
								{/* Left Column: Event Carousel */}
								<div className="order-2 lg:order-1">
									<EventCarousel className="h-full" />
								</div>

								{/* Right Column: Search and Filters */}
								<div className="order-1 lg:order-2">
									<div className="glass rounded-2xl p-5 lg:p-6">
										<h2 className="text-xl md:text-2xl font-bold text-white mb-5 text-center">
											Find Your Perfect Event
										</h2>

										{/* Enhanced Search Section */}
										<div className="space-y-4">
											{/* Main Search Bar */}
											<div className="space-y-3">
												<input
													type="text"
													placeholder="Search events..."
													value={searchQuery}
													onChange={(e) => setSearchQuery(e.target.value)}
													className="w-full px-4 py-3 rounded-lg glass text-white placeholder:text-white/70 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
												/>
												<input
													type="text"
													placeholder="Location (city, venue)..."
													value={locationQuery}
													onChange={(e) => setLocationQuery(e.target.value)}
													className="w-full px-4 py-3 rounded-lg glass text-white placeholder:text-white/70 border-none focus:border-white/30 focus:ring-0 focus:outline-none focus:ring-white/20 focus-visible:ring-white/20 focus-visible:border-white/30"
												/>
												<button
													onClick={handleSearch}
													className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm border border-white/20 hover:border-white/30"
												>
													Search Events
												</button>
											</div>

											{/* Category Filter Pills */}
											<div>
												<h3 className="text-white font-semibold mb-2 text-sm">
													Categories
												</h3>
												<div className="flex flex-wrap gap-2">
													{categories.map((category) => {
														const isSelected =
															selectedCategory === category.value;
														let buttonClasses =
															'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 backdrop-blur-sm border ';

														// Always show colors, but with different opacity/intensity based on selection
														switch (category.value) {
															case 'all':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-white/30 to-white/20 border-white/40 text-white shadow-lg scale-105'
																	: 'bg-gradient-to-r from-white/15 to-white/10 border-white/25 text-white/90 hover:from-white/25 hover:to-white/15 hover:scale-105';
																break;
															case 'Music':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-purple-500/40 to-pink-500/30 border-purple-400/50 text-white shadow-lg shadow-purple-500/25 scale-105'
																	: 'bg-gradient-to-r from-purple-500/20 to-pink-500/15 border-purple-400/30 text-white/90 hover:from-purple-500/30 hover:to-pink-500/20 hover:scale-105';
																break;
															case 'Sports':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-green-500/40 to-emerald-500/30 border-green-400/50 text-white shadow-lg shadow-green-500/25 scale-105'
																	: 'bg-gradient-to-r from-green-500/20 to-emerald-500/15 border-green-400/30 text-white/90 hover:from-green-500/30 hover:to-emerald-500/20 hover:scale-105';
																break;
															case 'Technology':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-blue-500/40 to-cyan-500/30 border-blue-400/50 text-white shadow-lg shadow-blue-500/25 scale-105'
																	: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/15 border-blue-400/30 text-white/90 hover:from-blue-500/30 hover:to-cyan-500/20 hover:scale-105';
																break;
															case 'Food & Drink':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-orange-500/40 to-red-500/30 border-orange-400/50 text-white shadow-lg shadow-orange-500/25 scale-105'
																	: 'bg-gradient-to-r from-orange-500/20 to-red-500/15 border-orange-400/30 text-white/90 hover:from-orange-500/30 hover:to-red-500/20 hover:scale-105';
																break;
															case 'Art & Culture':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-indigo-500/40 to-purple-500/30 border-indigo-400/50 text-white shadow-lg shadow-indigo-500/25 scale-105'
																	: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/15 border-indigo-400/30 text-white/90 hover:from-indigo-500/30 hover:to-purple-500/20 hover:scale-105';
																break;
															case 'Business':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-gray-500/40 to-slate-500/30 border-gray-400/50 text-white shadow-lg shadow-gray-500/25 scale-105'
																	: 'bg-gradient-to-r from-gray-500/20 to-slate-500/15 border-gray-400/30 text-white/90 hover:from-gray-500/30 hover:to-slate-500/20 hover:scale-105';
																break;
															case 'Education':
																buttonClasses += isSelected
																	? 'bg-gradient-to-r from-yellow-500/40 to-amber-500/30 border-yellow-400/50 text-white shadow-lg shadow-yellow-500/25 scale-105'
																	: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/15 border-yellow-400/30 text-white/90 hover:from-yellow-500/30 hover:to-amber-500/20 hover:scale-105';
																break;
															default:
																buttonClasses += isSelected
																	? 'bg-white/30 text-white border-white/40 shadow-lg scale-105'
																	: 'bg-white/15 text-white/80 border-white/25 hover:bg-white/25 hover:scale-105';
														}

														return (
															<button
																key={category.value}
																onClick={() =>
																	handleCategoryClick(category.value)
																}
																className={buttonClasses}
															>
																{category.label}
															</button>
														);
													})}
												</div>
											</div>

											{/* Quick Filter Options */}
											<div>
												<h3 className="text-white font-semibold mb-2 text-sm">
													Quick Filters
												</h3>
												<div className="grid grid-cols-2 gap-2">
													<button
														onClick={() => handleDateFilterClick('weekend')}
														className={`px-2 py-1.5 rounded-lg backdrop-blur-sm border transition-all duration-300 text-xs ${
															dateFilter === 'weekend'
																? 'border-white/30 text-white bg-white/20'
																: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
														}`}
													>
														This Weekend
													</button>
													<button
														onClick={() => handleDateFilterClick('nextweek')}
														className={`px-2 py-1.5 rounded-lg backdrop-blur-sm border transition-all duration-300 text-xs ${
															dateFilter === 'nextweek'
																? 'border-white/30 text-white bg-white/20'
																: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
														}`}
													>
														Next Week
													</button>
													<button
														onClick={() => handleDateFilterClick('free')}
														className={`px-2 py-1.5 rounded-lg backdrop-blur-sm border transition-all duration-300 text-xs ${
															dateFilter === 'free'
																? 'border-white/30 text-white bg-white/20'
																: 'border-white/20 text-white/70 hover:text-white hover:bg-white/10'
														}`}
													>
														Free Events
													</button>
													<button className="px-2 py-1.5 rounded-lg backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-300 text-xs">
														Near Me
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					{/* Events Section */}
					<section
						ref={eventsRef}
						className="py-16 relative"
					>
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
								limit={4}
							/>

							{/* More Events Button */}
							<div className="text-center mt-8">
								<Link
									href="/events"
									className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-black/25 backdrop-blur-sm border border-white/20 hover:border-white/30"
								>
									<span>View All Events</span>
									<svg
										className="w-5 h-5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17 8l4 4m0 0l-4 4m4-4H3"
										/>
									</svg>
								</Link>
							</div>
						</div>
					</section>

					{/* Features Section */}
					<section className="py-16 relative">
						<div className="absolute inset-0 glass-dark rounded-none" />
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
							<div className="text-center mb-12">
								<h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
									Why Choose Hiburan?
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
