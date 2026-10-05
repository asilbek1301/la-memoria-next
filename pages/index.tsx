import { NextPage } from 'next';
import useDeviceDetect from '../libs/hooks/useDeviceDetect';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import PopularPackages from '../libs/components/homepage/PopularPackages';
import TopStudios from '../libs/components/homepage/TopStudios';
import Events from '../libs/components/homepage/Events';
import TrendPackages from '../libs/components/homepage/TrendPackages';
import TopPackages from '../libs/components/homepage/TopPackages';
import { Stack } from '@mui/material';
import Advertisement from '../libs/components/homepage/Advertisement';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	const device = useDeviceDetect();

	if (device === 'mobile') {
		return (
			<Stack className={'home-page'}>
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<TopPackages />
				<TopStudios />
			</Stack>
		);
	} else {
		return (
			<Stack className={'home-page'}>
				<TrendPackages />
				<PopularPackages />
				<Advertisement />
				<TopPackages />
				<TopStudios />
				<Events />
				<CommunityBoards />
			</Stack>
		);
	}
};

export default withLayoutMain(Home);
