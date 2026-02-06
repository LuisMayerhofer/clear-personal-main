import { FC } from 'react';
import Clear from './Clear';
import LanguagePicker from './LanguagePicker';

const TopBar: FC = () => {
	return (
		<header className="z-1 flex w-screen flex-row justify-between px-[24px] py-[21.5px]">
			<Clear />
			<LanguagePicker />
		</header>
	);
};

export default TopBar;
