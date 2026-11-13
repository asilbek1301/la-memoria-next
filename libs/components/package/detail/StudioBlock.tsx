import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Member } from '../../../types/member/member';
import { GET_MEMBER } from '../../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../../apollo/user/mutation';
import { Messages } from '../../../config';
import { sweetMixinErrorAlert } from '../../../sweetAlert';
import { studioHref, studioImage, studioLocation, studioName, studioStats } from '../../studio/studioSearch';

interface StudioBlockProps {
	/** the studio from the package query, shown until the full member arrives */
	studio: Member;
	user: any;
}

/** "The studio": framed arch portrait, name, location, counts, Follow and View studio **/
const StudioBlock = (props: StudioBlockProps) => {
	const { studio: fallback, user } = props;
	const { t } = useTranslation('common');

	/** APOLLO REQUESTS: the studio with follower count and whether the viewer follows it **/
	const { data, refetch } = useQuery(GET_MEMBER, {
		variables: { input: fallback?._id },
		skip: !fallback?._id,
		fetchPolicy: 'cache-and-network',
	});
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const studio: Member = data?.getMember ?? fallback;
	const name = studioName(studio);
	const href = studioHref(studio);
	const image = studioImage(studio);
	const location = studioLocation(studio?.memberAddress, t);
	const stats = studioStats(studio, t);
	const following = Boolean(studio?.meFollowed?.[0]?.myFollowing);
	const isSelf = user?._id && user._id === studio?._id;

	const followHandler = async () => {
		try {
			if (!user?._id) throw new Error(Messages.error2);
			if (following) await unsubscribe({ variables: { input: studio._id } });
			else await subscribe({ variables: { input: studio._id } });
			await refetch({ input: studio._id });
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<div className={'studio-block'}>
			<Link href={href} className={'block-portrait'} tabIndex={-1} aria-hidden="true">
				{image ? <img src={image} alt="" loading="lazy" /> : <span className={'arch-initial'}>{name.charAt(0)}</span>}
			</Link>
			<div className={'block-info'}>
				{location && <p className={'block-location'}>{location}</p>}
				<h3 className={'block-name'}>
					<Link href={href}>{name}</Link>
				</h3>
				{stats && <p className={'block-stats'}>{stats}</p>}
			</div>
			<div className={'block-actions'}>
				{!isSelf && (
					<button
						type="button"
						className={`button-secondary follow-btn ${following ? 'following' : ''}`}
						aria-pressed={following}
						onClick={followHandler}
					>
						{following ? t('Following') : t('Follow')}
					</button>
				)}
				<Link href={href} className={'button-link'}>
					{t('View studio')}
					<ArrowForwardRoundedIcon />
				</Link>
			</div>
		</div>
	);
};

export default StudioBlock;
