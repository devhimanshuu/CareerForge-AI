'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import Link from 'next/link';
import Image from 'next/image';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{
			label: 'Features',
			href: '#features',
		},
		{
			label: 'How it Works',
			href: '#how-it-works',
		},
		{
			label: 'Pricing',
			href: '#pricing',
		},
	];

	React.useEffect(() => {
		if (open) {
			// Disable scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Re-enable scroll
			document.body.style.overflow = '';
		}

		// Cleanup when component unmounts (important for Next.js)
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn(
				'sticky top-0 z-[9999] mx-auto w-full max-w-7xl border-b border-transparent md:rounded-2xl md:border md:transition-all md:ease-out',
				{
					'bg-background/95 supports-[backdrop-filter]:bg-background/50 border-border/50 backdrop-blur-xl md:top-4 md:max-w-5xl md:shadow-2xl md:shadow-indigo-500/10':
						scrolled && !open,
					'bg-background/90': open,
				},
			)}
		>
			<nav
				className={cn(
					'flex h-16 w-full items-center justify-between px-6 md:h-14 md:transition-all md:ease-out',
					{
						'md:px-4': scrolled,
					},
				)}
			>
				{/* Logo Section */}
				<Link href="/" className="flex items-center gap-2 group">
					<Image
						src="/CareerForge_ai_final.png"
						alt="CareerForge AI Logo"
						width={32}
						height={32}
						className="group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]"
					/>
					<span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-indigo-500 to-indigo-400 bg-clip-text text-transparent hidden sm:block">
						CareerForge AI
					</span>
				</Link>

				<div className="hidden items-center gap-4 md:flex">
					{links.map((link, i) => (
						<Link 
							key={i} 
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								"text-sm font-medium text-muted-foreground hover:text-indigo-500 transition-colors"
							)} 
							href={link.href}
						>
							{link.label}
						</Link>
					))}
					<div className="w-px h-4 bg-border/50 mx-1" />
					<ThemeToggle />
					<Link
						href="/sign-in"
						className="text-sm font-medium text-muted-foreground hover:text-indigo-500 transition-colors"
					>
						Sign In
					</Link>
					<Button asChild className="text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 rounded-xl px-5">
						<Link href="/sign-up">
							Get Started
						</Link>
					</Button>
				</div>
				
				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<Button size="icon" variant="ghost" onClick={() => setOpen(!open)} className="rounded-xl hover:bg-indigo-500/10 text-muted-foreground hover:text-indigo-500">
						<MenuToggleIcon open={open} className="size-6" duration={300} />
					</Button>
				</div>
			</nav>

			<div
				className={cn(
					'bg-background/95 backdrop-blur-2xl fixed top-16 right-0 bottom-0 left-0 z-[9998] flex flex-col overflow-y-auto scrollbar-none border-y border-border/50 md:hidden',
					open ? 'block' : 'hidden',
				)}
			>
				<div
					data-slot={open ? 'open' : 'closed'}
					className={cn(
						'data-[slot=open]:animate-in data-[slot=open]:slide-in-from-top-5 data-[slot=closed]:animate-out data-[state=closed]:slide-out-to-top-5 ease-out duration-300',
						'flex h-full w-full flex-col justify-between gap-y-4 p-8',
					)}
				>
					<div className="grid gap-y-4">
						{links.map((link) => (
							<Link
								key={link.label}
								className={cn(
									buttonVariants({
										variant: 'ghost',
										className: 'justify-start text-lg font-bold h-14 rounded-2xl px-6',
									}),
									"hover:bg-indigo-500/10 hover:text-indigo-500"
								)}
								href={link.href}
								onClick={() => setOpen(false)}
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-3 pb-8">
						<Button asChild variant="outline" className="w-full h-14 rounded-2xl font-bold border-border/50 glass hover:bg-indigo-500/5">
							<Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
						</Button>
						<Button asChild className="w-full h-14 rounded-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
							<Link href="/sign-up" onClick={() => setOpen(false)}>Get Started Free</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}
