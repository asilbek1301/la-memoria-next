import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Member } from '../../types/member/member';
import { userVar } from '../../../apollo/store';
import { studioHref, studioImage, studioLocation, studioName, studioStats } from './studioSearch';

interface StudioCardProps {
	studio: Member;
	likeMemberHandler: (user: any, id: string) => void;
}

/** studios grid card: framed arch portrait, then the location, name, description and counts, centred **/
const StudioCard = (props: StudioCardProps) => {
	const { studio, likeMemberHandler } = props;
	const user = useReactiveVar(userVar);
	const name = studioName(studio);
	const href = studioHref(studio);
	const image = studioImage(studio);
	const location = studioLocation(studio?.memberAddress);
	const stats = studioStats(studio);
	const isLiked = Boolean(studio?.meLiked && studio.meLiked[0]?.myFavorite);

	return (
		<article className={'studio-tile'}>
			<div className={'arch-frame'}>
				<Link href={href} className={'arch-media'} tabIndex={-1} aria-hidden="true">
					{image ? <img src={image} alt="" loading="lazy" /> : <span className={'arch-initial'}>{name.charAt(0)}</span>}
				</Link>
				<button
					type="button"
					className={`like-btn ${isLiked ? 'liked' : ''}`}
					aria-label={isLiked ? `Remove ${name} from saved studios` : `Save ${name}`}
					aria-pressed={isLiked}
					onClick={() => likeMemberHandler(user, studio?._id)}
				>
					{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
				</button>
			</div>
			{location && <p className={'tile-location'}>{location}</p>}
			<h3 className={'tile-name'}>
				<Link href={href}>{name}</Link>
			</h3>
			{studio?.memberDesc && <p className={'tile-desc'}>{studio.memberDesc}</p>}
			{stats && <p className={'tile-stats'}>{stats}</p>}
			<Link href={href} className={'button-link'} tabIndex={-1} aria-hidden="true">
				View studio
				<ArrowForwardRoundedIcon />
			</Link>
		</article>
	);
};

export default StudioCard;
