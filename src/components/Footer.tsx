import Link from 'next/link';

export default function Footer() {
	return (
		<footer className="bg-gradient-to-t from-slate-900 to-transparent backdrop-blur-md border-t border-white/20 text-white relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
			</div>
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid md:grid-cols-4 gap-8">
					{/* Company Info */}
					<div className="col-span-1">
						<div className="flex items-center gap-2 text-xl font-bold mb-4">
							<div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center backdrop-blur-sm">
								<span className="text-white font-bold text-sm">H</span>
							</div>
							<span className="bg-gradient-to-r from-white via-orange-200 to-orange-500 bg-clip-text text-transparent">
								HiburanApp
							</span>
						</div>
						<p className="text-white/70 mb-4">
							Discover and book amazing events happening around you. From
							concerts to conferences, we have it all.
						</p>
						<div className="flex space-x-4">
							<a
								href="#"
								className="text-white/60 hover:text-white transition-colors duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
								</svg>
							</a>
							<a
								href="#"
								className="text-white/60 hover:text-white transition-colors duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
								</svg>
							</a>
							<a
								href="#"
								className="text-white/60 hover:text-white transition-colors duration-300 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm"
							>
								<svg
									className="w-5 h-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
								</svg>
							</a>
						</div>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-lg font-semibold mb-4 text-white">
							Quick Links
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/events"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Browse Events
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* For Organizers */}
					<div>
						<h3 className="text-lg font-semibold mb-4 text-white">
							For Organizers
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/register"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Create Account
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/help"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="/pricing"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Pricing
								</Link>
							</li>
						</ul>
					</div>

					{/* Support */}
					<div>
						<h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/help"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Help Center
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/refund"
									className="text-white/70 hover:text-white transition-colors duration-300"
								>
									Refund Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
					<p className="text-white/60 text-sm">
						© 2025 HiburanApp. All rights reserved.
					</p>
					<div className="flex space-x-6 mt-4 md:mt-0">
						<Link
							href="/terms"
							className="text-white/60 hover:text-white text-sm transition-colors duration-300"
						>
							Terms
						</Link>
						<Link
							href="/privacy"
							className="text-white/60 hover:text-white text-sm transition-colors duration-300"
						>
							Privacy
						</Link>
						<Link
							href="/cookies"
							className="text-white/60 hover:text-white text-sm transition-colors duration-300"
						>
							Cookies
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}
