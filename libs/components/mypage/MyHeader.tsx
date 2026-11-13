import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import moment from 'moment';
import { Member } from '../../types/member/member';
import { REACT_APP_API_URL } from '../../config';
import { memberPhoto, plural, studioName } from '../studio/studioSearch';

interface MyHeaderProps {
	member: Member | undefined;
	user: any;
	isStudio: boolean;
	savedTotal: number;
	reservationTotal: number;
	/** up to three photos for the fan of prints: liked packages (couples) or your own packages (studios) */
	prints: string[];
	/** opens the Following / Followers panel */
	onOpenFollows: (mode: 'followings' | 'followers') => void;
}

/** "your album cover": greeting, member since and counts on the left, a fan of printed photos on the right **/
const MyHeader = (props: MyHeaderProps) => {
	const { member, user, isStudio, savedTotal, reservationTotal, prints, onOpenFollows } = props;
	const { t } = useTranslation('common');
	const source = member ?? user;
	const name = studioName(source);
	const avatar = memberPhoto(source?.memberImage);
	const following = member?.memberFollowings ?? 0;
	const followers = member?.memberFollowers ?? 0;
	const packages = member?.memberPackages ?? 0;
	const stats = (
		isStudio
			? [
					packages > 0 && plural(packages, 'package', t),
					reservationTotal > 0 && plural(reservationTotal, 'reservation', t),
			  ]
			: [
					savedTotal > 0 && t('{{count}} liked', { count: savedTotal }),
					reservationTotal > 0 && plural(reservationTotal, 'reservation', t),
			  ]
	).filter(Boolean) as string[];
	const photos = prints.slice(0, 3);

	return (
		<header className={'my-hero'}>
			<div className={'hero-copy'}>
				<div className={'hero-who'}>
					<span className={'my-avatar'} aria-hidden="true">
						{avatar ? <img src={avatar} alt="" /> : <span className={'arch-initial'}>{name.charAt(0)}</span>}
					</span>
					{member?.createdAt && (
						<span className={'my-since'}>
							{t('Member since {{date}}', { date: moment(member.createdAt).format(t('MMMM YYYY')) })}
						</span>
					)}
				</div>
				<h1 className={'my-greeting'}>
					{t('Welcome back,')} <span className={'greeting-name'}>{name}</span>
				</h1>
				{/* counts, follow pills and Edit profile share one line */}
				<div className={'hero-meta'}>
					{stats.length > 0 && (
						<p className={'my-stats'}>
							{stats.map((stat, index) => (
								<span key={stat}>
									{index > 0 && (
										<span className={'stat-dot'} aria-hidden="true">
											·
										</span>
									)}
									{stat}
								</span>
							))}
						</p>
					)}
					{(following > 0 || followers > 0) && (
						<div className={'hero-follows'}>
							{following > 0 && (
								<button type="button" className={'follow-pill'} onClick={() => onOpenFollows('followings')}>
									<strong>{following}</strong> {t('Following', { context: 'list' })}
								</button>
							)}
							{followers > 0 && (
								<button type="button" className={'follow-pill'} onClick={() => onOpenFollows('followers')}>
									<strong>{followers}</strong> {followers === 1 ? t('Follower') : t('Followers')}
								</button>
							)}
						</div>
					)}
					<Link href={{ pathname: '/mypage', query: { category: 'myProfile' } }} className={'button-link'}>
						{t('Edit profile')}
					</Link>
				</div>
			</div>

			{/* a fan of printed photos, like prints laid out on a table */}
			<div className={`hero-prints count-${Math.max(photos.length, 1)}`} aria-hidden="true">
				{photos.length > 0 ? (
					photos.map((photo, index) => (
						<span className={`print print-${index + 1}`} key={photo + index}>
							<img src={`${REACT_APP_API_URL}/${photo}`} alt="" />
						</span>
					))
				) : (
					<span className={'print print-1 print-empty'}>
						<img src="/img/logo/monogram.svg" alt="" />
					</span>
				)}
			</div>
		</header>
	);
};

export default MyHeader;
