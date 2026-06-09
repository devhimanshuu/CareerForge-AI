'use client';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
	const [open, setOpen] = React.useState(false);

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
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className='sticky top-0 z-[9999] w-full bg-background border-b border-border/40'
		>
			<nav
				className='mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-6 lg:px-8'
			>
				{/* Logo Section */}
				<Link href="/" className="flex items-center gap-3 group shrink-0">
					<div className="relative">
						<div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl group-hover:bg-indigo-500/30 transition-all duration-500" />
						<Image
							src="/CareerForge_ai_final.png"
							alt="CareerForge AI Logo"
							width={36}
							height={36}
							className="relative group-hover:scale-105 transition-all duration-500 drop-shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
						/>
					</div>
					<span className="font-display font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent hidden sm:block">
						CareerForge AI
					</span>
				</Link>

				{/* Desktop Navigation */}
				<div className="hidden lg:flex items-center gap-1">
					{links.map((link) => (
						<Link
							key={link.label}
							href={link.href}
							className={cn(
								'relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-xl hover:bg-muted/50',
								'after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-0 after:bg-indigo-500 after:transition-all after:duration-300 after:-translate-x-1/2',
								'hover:after:w-3/4',
							)}
						>
							{link.label}
						</Link>
					))}
				</div>

				{/* Desktop Actions */}
				<div className="hidden lg:flex items-center gap-3">
					<ThemeToggle />
					<div className="w-px h-5 bg-border/60 mx-1" />
					<Link
						href="/sign-in"
						className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 px-3 py-2"
					>
						Sign In
					</Link>
					<Button
						asChild
						className="relative text-sm font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:via-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 rounded-xl px-5 py-2.5 group overflow-hidden"
					>
						<Link href="/sign-up">
							<span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
							<Sparkles className="h-4 w-4 mr-1.5" />
							Get Started Free
						</Link>
					</Button>
				</div>

				{/* Mobile Actions */}
				<div className="flex items-center gap-2 lg:hidden">
					<ThemeToggle />
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setOpen(!open)}
						className="rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
					>
						<MenuToggleIcon open={open} className="size-5" duration={300} />
					</Button>
				</div>
			</nav>

			{/* Mobile Menu */}
			<div
				className={cn(
					'fixed top-[72px] right-0 bottom-0 left-0 z-[9998] flex flex-col bg-background/95 backdrop-blur-2xl border-t border-border/40 lg:hidden transition-all duration-300 ease-out',
					open
						? 'opacity-100 pointer-events-auto translate-y-0'
						: 'opacity-0 pointer-events-none -translate-y-4',
				)}
			>
				<div className="flex flex-col justify-between flex-1 px-6 pt-8 pb-8">
					<div className="flex flex-col gap-1">
						{links.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								onClick={() => setOpen(false)}
								className="text-lg font-medium text-foreground hover:text-indigo-500 hover:bg-indigo-500/5 transition-all duration-200 rounded-2xl px-5 py-4"
							>
								{link.label}
							</Link>
						))}
					</div>
					<div className="flex flex-col gap-3 pt-4 border-t border-border/40">
						<Button
							asChild
							variant="outline"
							className="w-full h-14 rounded-2xl font-semibold border-border/60 hover:bg-muted/50 hover:border-indigo-500/30 transition-all duration-300"
						>
							<Link href="/sign-in" onClick={() => setOpen(false)}>Sign In</Link>
						</Button>
						<Button
							asChild
							className="w-full h-14 rounded-2xl font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-xl shadow-indigo-500/20 transition-all duration-300 gap-2"
						>
							<Link href="/sign-up" onClick={() => setOpen(false)}>
								<Sparkles className="h-4 w-4" />
								Get Started Free
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</header>
	);
}