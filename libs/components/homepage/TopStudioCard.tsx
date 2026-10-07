import React from 'react';
import Link from 'next/link';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';

interface TopStudioProps {
	studio: Member;
}

const TopStudioCard = (props: TopStudioProps) => {
	const { studio } = props;
	const name = studio?.memberFullName || studio?.memberNick;
	const image = studio?.memberImage ? `${REACT_APP_API_URL}/${studio.memberImage}` : '';
	const href = { pathname: '/studio/detail', query: { studioId: studio?._id } };

	return (
		<article className={'studio-card'}>
			<Link href={href} className={'card-media'} tabIndex={-1} aria-hidden="true">
				{image ? (
					<img src={image} alt="" loading="lazy" />
				) : (
					<span className={'img-placeholder initial'}>{name?.charAt(0).toUpperCase()}</span>
				)}
			</Link>
			<div className={'card-head'}>
				<h3>
					<Link href={href}>{name}</Link>
				</h3>
				{(studio?.memberPackages ?? 0) > 0 && (
					<span className={'card-count'}>
						{studio.memberPackages} {studio.memberPackages === 1 ? 'package' : 'packages'}
					</span>
				)}
			</div>
			{studio?.memberAddress && <p className={'card-location'}>{studio.memberAddress}</p>}
			{studio?.memberDesc && <p className={'card-desc'}>{studio.memberDesc}</p>}
		</article>
	);
};

export default TopStudioCard;
