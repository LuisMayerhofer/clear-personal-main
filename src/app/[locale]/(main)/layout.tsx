import NavBar from '@/components/NavBar';

const MainNavigationLayout = async ({ children }: { children: React.ReactNode }) => {
	return (
		<div className="mr-[24px] mb-[24px] flex flex-1 grow items-center gap-[24px]">
			<NavBar />
			{children}
		</div>
	);
};

export default MainNavigationLayout;
