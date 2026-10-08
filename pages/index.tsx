import { NextPage } from 'next';
import withLayoutMain from '../libs/components/layout/LayoutHome';
import TrendPackages from '../libs/components/homepage/TrendPackages';
import HomeStory from '../libs/components/homepage/HomeStory';
import PopularPackages from '../libs/components/homepage/PopularPackages';
import PackageTiers from '../libs/components/homepage/PackageTiers';
import TopStudios from '../libs/components/homepage/TopStudios';
import CommunityBoards from '../libs/components/homepage/CommunityBoards';
import HomeContact from '../libs/components/homepage/HomeContact';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Home: NextPage = () => {
	return (
		<div className={'home-page'}>
			<TrendPackages />
			<HomeStory />
			<PopularPackages />
			<PackageTiers />
			<TopStudios />
			<CommunityBoards />
			<HomeContact />
		</div>
	);
};

export default withLayoutMain(Home);
