import Navbar from '@/components/Navbar';
import EventListHome from '../components/EventListHome';
import Footer from '@/components/Footer';

export default function Home() {
	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-gray-50">
				{/* Hero Section */}
				<section className="bg-gradient-to-r from-primary to-blue-600 text-white py-20">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h1 className="text-4xl md:text-6xl font-bold mb-6">
							Discover Amazing Events
						</h1>
						<p className="text-xl md:text-2xl mb-8 text-blue-100">
							Find and book tickets for concerts, workshops, conferences, and
							more
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
							<input
								type="text"
								placeholder="Search events..."
								className="flex-1 px-6 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-blue-300"
							/>
							<button className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
								Search Events
							</button>
						</div>
					</div>
				</section>

				{/* Events Section */}
				<section className="py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Upcoming Events
							</h2>
							<p className="text-lg text-gray-600">
								Discover events happening near you
							</p>
						</div>

						<EventListHome />
					</div>
				</section>

				{/* Features Section */}
				<section className="bg-white py-16">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-12">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								Why Choose HiburanApp?
							</h2>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							<div className="text-center">
								<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg
										className="w-8 h-8 text-primary"
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
								<h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
								<p className="text-gray-600">
									Book tickets in just a few clicks with our simple and secure
									process.
								</p>
							</div>

							<div className="text-center">
								<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg
										className="w-8 h-8 text-primary"
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
								<h3 className="text-xl font-semibold mb-2">Local Events</h3>
								<p className="text-gray-600">
									Discover events happening in your city and nearby locations.
								</p>
							</div>

							<div className="text-center">
								<div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
									<svg
										className="w-8 h-8 text-primary"
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
								<h3 className="text-xl font-semibold mb-2">
									Secure & Reliable
								</h3>
								<p className="text-gray-600">
									Your payments are secure and your tickets are guaranteed.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
