import React from 'react';
import { useQuery } from '@apollo/client';
import { useTranslation } from 'next-i18next';
import { Skeleton } from '@mui/material';
import TopStudioCard from './TopStudioCard';
import { Member } from '../../types/member/member';
import { StudiosInquiry } from '../../types/member/member.input';
import { GET_STUDIOS } from '../../../apollo/user/query';
import HomeSection, { EmptyState, ViewAllLink } from './HomeSection';

interface TopStudiosProps {
	initialInput: StudiosInquiry;
}

const TopStudios = (props: TopStudiosProps) => {
	const { initialInput } = props;
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS **/

	const { loading: getStudiosLoading, data: getStudiosData } = useQuery(GET_STUDIOS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: initialInput },
		notifyOnNetworkStatusChange: true,
	});
	const topStudios: Member[] = getStudiosData?.getStudios?.list ?? [];
	const total: number = getStudiosData?.getStudios?.metaCounter?.[0]?.total ?? 0;

	return (
		<HomeSection
			id="studios"
			title={t('The Studios')}
			aside={
				<ViewAllLink
					href={'/studio'}
					label={total ? t('All studios ({{count}})', { count: total }) : t('All studios')}
				/>
			}
		>
			{getStudiosLoading && topStudios.length === 0 ? (
				<div className={'studio-grid'} aria-busy="true" aria-label={t('Loading studios')}>
					{[0, 1, 2, 3].map((i) => (
						<div key={i}>
							<Skeleton variant="rectangular" className={'skeleton square'} />
							<Skeleton width="60%" />
							<Skeleton width="90%" />
						</div>
					))}
				</div>
			) : topStudios.length === 0 ? (
				<EmptyState message={t('No studios have joined yet.')} href="/account/join" linkLabel={t('Join as a studio')} />
			) : (
				<div className={'studio-grid'}>
					{topStudios.map((studio: Member) => (
						<TopStudioCard studio={studio} key={studio?._id} />
					))}
				</div>
			)}
		</HomeSection>
	);
};

TopStudios.defaultProps = {
	initialInput: {
		page: 1,
		limit: 4,
		sort: 'memberRank',
		direction: 'DESC',
		search: {},
	},
};

export default TopStudios;
