import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Drawer, Skeleton } from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import withLayoutFull from '../../libs/components/layout/LayoutFull';
import PackageGallery from '../../libs/components/package/detail/PackageGallery';
import BookingPanel from '../../libs/components/package/detail/BookingPanel';
import StudioBlock from '../../libs/components/package/detail/StudioBlock';
import CommentsSection from '../../libs/components/common/CommentsSection';
import { CommentGroup } from '../../libs/enums/comment.enum';
import PopularPackageCard from '../../libs/components/homepage/PopularPackageCard';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import { formatHours } from '../../libs/components/package/packageSearch';
import { studioName } from '../../libs/components/studio/studioSearch';
import ViewCount from '../../libs/components/common/ViewCount';
import { Package } from '../../libs/types/package/package';
import { T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { formatKRW, packageSearchHref, prettyEnum } from '../../libs/utils';
import { userVar } from '../../apollo/store';
import { GET_PACKAGE, GET_PACKAGES } from '../../apollo/user/query';
import { CREATE_RESERVATION, LIKE_TARGET_PACKAGE } from '../../apollo/user/mutation';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const SIMILAR_LIMIT = 4;
const DESC_PREVIEW = 480;

const similarInput = (search: object) => ({
	page: 1,
	limit: SIMILAR_LIMIT + 1,
	sort: 'packageLikes',
	direction: Direction.DESC,
	search,
});

const PackageDetail: NextPage = () => {
	const router = useRouter();
	const device = useDeviceDetect();
	const user = useReactiveVar(userVar);
	const packageId = typeof router.query.id === 'string' ? router.query.id : '';
	const [sheetOpen, setSheetOpen] = useState<boolean>(false);
	const [descOpen, setDescOpen] = useState<boolean>(false);
	const [copied, setCopied] = useState<boolean>(false); // the share button shows a check for a moment

	/** APOLLO REQUESTS **/

	const [likeTargetPackage] = useMutation(LIKE_TARGET_PACKAGE);
	const [createReservation] = useMutation(CREATE_RESERVATION);

	// getPackage also records the view on the backend
	const {
		data: packageData,
		loading: packageLoading,
		error: packageError,
		refetch: getPackageRefetch,
	} = useQuery(GET_PACKAGE, {
		fetchPolicy: 'network-only',
		variables: { input: packageId },
		skip: !packageId,
		notifyOnNetworkStatusChange: true,
	});
	const pkg: Package | undefined = packageData?.getPackage;

	// similar packages: same city first, then the same tier, without duplicates or this package
	const { data: cityData, refetch: cityRefetch } = useQuery(GET_PACKAGES, {
		variables: { input: similarInput({ locationList: [pkg?.packageLocation] }) },
		skip: !pkg?.packageLocation,
	});
	const { data: tierData, refetch: tierRefetch } = useQuery(GET_PACKAGES, {
		variables: { input: similarInput({ typeList: [pkg?.packageType] }) },
		skip: !pkg?.packageType,
	});
	const similar: Package[] = [...(cityData?.getPackages?.list ?? []), ...(tierData?.getPackages?.list ?? [])]
		.filter(
			(item: Package, index: number, list: Package[]) =>
				item._id !== pkg?._id && list.findIndex((x) => x._id === item._id) === index,
		)
		.slice(0, SIMILAR_LIMIT);

	/** HANDLERS **/

	const likePackageHandler = async (likeUser: T, id: string) => {
		try {
			if (!id) return;
			if (!likeUser?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetPackage({ variables: { input: id } });
			if (id === pkg?._id) await getPackageRefetch({ input: id });
			else await Promise.all([cityRefetch(), tierRefetch()]);
		} catch (err: any) {
			console.log('Error:likePackageHandler', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const createReservationHandler = async (date: string, note: string): Promise<boolean> => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await createReservation({
				variables: {
					input: {
						packageId,
						reservationDate: new Date(date),
						reservationNote: note || undefined,
					},
				},
			});
			return true;
		} catch (err: any) {
			sweetMixinErrorAlert(err.message).then();
			return false;
		}
	};

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 2000);
		return () => clearTimeout(timer);
	}, [copied]);

	const shareHandler = async () => {
		const url = window.location.href;
		try {
			if (navigator.share) await navigator.share({ title: pkg?.packageTitle, url });
			else {
				await navigator.clipboard.writeText(url);
				setCopied(true);
			}
		} catch {
			// the share sheet was closed: nothing to do
		}
	};

	/** STATES **/

	const notFound = router.isReady && (!packageId || Boolean(packageError) || (!packageLoading && !pkg));

	if (notFound) {
		return (
			<div id="package-detail-page" className={'detail-page'}>
				<div className={'container'}>
					<div className={'empty-box detail-missing'}>
						<p>Package not found.</p>
						<Link href={'/package'} className={'button-primary'}>
							Back to packages
						</Link>
					</div>
				</div>
			</div>
		);
	}

	if (!pkg) {
		return (
			<div id="package-detail-page" className={'detail-page'} aria-busy="true" aria-label="Loading package">
				<div className={'container'}>
					<Skeleton width={260} className={'crumb-skeleton'} />
					<Skeleton variant="rectangular" className={'skeleton gallery-skeleton'} />
					<div className={'detail-layout'}>
						<div className={'detail-main'}>
							<Skeleton width="30%" />
							<Skeleton width="70%" height={64} />
							<Skeleton width="40%" />
							<Skeleton variant="rectangular" className={'skeleton facts-skeleton'} />
						</div>
						{device !== 'mobile' && (
							<aside className={'detail-aside'}>
								<Skeleton variant="rectangular" className={'skeleton panel-skeleton'} />
							</aside>
						)}
					</div>
				</div>
			</div>
		);
	}

	const isLiked = Boolean(pkg.meLiked?.[0]?.myFavorite);
	const likes = pkg.packageLikes ?? 0;
	const views = pkg.packageViews ?? 0;
	const city = prettyEnum(pkg.packageLocation);
	const studio = pkg.memberData;
	const desc = pkg.packageDesc?.trim() ?? '';
	const longDesc = desc.length > DESC_PREVIEW;
	const includes = [
		{ label: 'Album', included: Boolean(pkg.packageAlbum) },
		{ label: 'Dress', included: Boolean(pkg.packageDress) },
		{ label: 'Hair & makeup', included: Boolean(pkg.packageMakeup) },
	];
	const facts = [
		{ icon: <ScheduleOutlinedIcon />, label: 'Duration', value: formatHours(pkg.packageDuration) },
		{ icon: <PhotoCameraOutlinedIcon />, label: 'Edited photos', value: `${pkg.packagePhotos} photos` },
		{ icon: <PaletteOutlinedIcon />, label: 'Style', value: prettyEnum(pkg.packageStyle) },
		{ icon: <PlaceOutlinedIcon />, label: 'Location', value: city, note: pkg.packageAddress },
	];

	const booking = <BookingPanel pkg={pkg} user={user} onRequest={createReservationHandler} />;

	return (
		<div id="package-detail-page" className={'detail-page'}>
			<div className={'container'}>
				<nav className={'breadcrumb'} aria-label="Breadcrumb">
					<ol>
						<li>
							<Link href={'/package'}>Packages</Link>
						</li>
						<li>
							<Link href={packageSearchHref({ locationList: [pkg.packageLocation] })}>{city}</Link>
						</li>
						<li aria-current="page">{pkg.packageTitle}</li>
					</ol>
				</nav>

				<PackageGallery images={pkg.packageImages} title={pkg.packageTitle} caption={pkg.packageAddress} />

				<div className={'detail-layout'}>
					<div className={'detail-main'}>
						<header className={'detail-head'}>
							<div className={'head-text'}>
								<p className={'head-meta'}>
									{city} — {prettyEnum(pkg.packageStyle)}
								</p>
								<h1 className={'head-title'}>{pkg.packageTitle}</h1>
								<div className={'head-sub'}>
									<span className={'tag'}>{prettyEnum(pkg.packageType)} tier</span>
									{studio && (
										<span className={'head-studio'}>
											By{' '}
											<Link href={{ pathname: '/studio/detail', query: { studioId: studio._id } }}>
												{studioName(studio)}
											</Link>
										</span>
									)}
								</div>
							</div>
							<div className={'head-actions'}>
								{views > 0 && <ViewCount count={views} className={'icon-action icon-stat'} />}
								<button
									type="button"
									className={`icon-action ${isLiked ? 'liked' : ''}`}
									aria-label={isLiked ? 'Unlike this package' : 'Like this package'}
									aria-pressed={isLiked}
									onClick={() => likePackageHandler(user, pkg._id)}
								>
									{isLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
									{likes > 0 && <span className={'action-count'}>{likes}</span>}
								</button>
								<button
									type="button"
									className={'icon-action'}
									aria-label={copied ? 'Link copied' : 'Share this package'}
									onClick={shareHandler}
								>
									{copied ? <CheckRoundedIcon /> : <IosShareRoundedIcon />}
								</button>
							</div>
						</header>

						<ul className={'fact-list'} aria-label="Key facts">
							{facts.map((fact) => (
								<li className={'fact'} key={fact.label}>
									<span className={'fact-icon'} aria-hidden="true">
										{fact.icon}
									</span>
									<span className={'fact-label'}>{fact.label}</span>
									<span className={'fact-value'}>{fact.value}</span>
									{fact.note && <span className={'fact-note'}>{fact.note}</span>}
								</li>
							))}
						</ul>

						<section className={'detail-section'} aria-labelledby="included-title">
							<h2 id="included-title" className={'detail-title'}>
								What&apos;s included
							</h2>
							<ul className={'include-list'}>
								{includes.map((item) => (
									<li className={`include-item ${item.included ? 'yes' : 'no'}`} key={item.label}>
										{item.included ? <CheckRoundedIcon aria-hidden="true" /> : <RemoveRoundedIcon aria-hidden="true" />}
										<span className={'include-name'}>{item.label}</span>
										<span className={'include-state'}>{item.included ? 'Included' : 'Not included'}</span>
									</li>
								))}
							</ul>
						</section>

						{desc && (
							<section className={'detail-section'} aria-labelledby="about-title">
								<h2 id="about-title" className={'detail-title'}>
									About this package
								</h2>
								<p className={`about-text ${longDesc && !descOpen ? 'clamped' : ''}`}>{desc}</p>
								{longDesc && (
									<button
										type="button"
										className={'button-link'}
										aria-expanded={descOpen}
										onClick={() => setDescOpen(!descOpen)}
									>
										{descOpen ? 'Show less' : 'Read more'}
									</button>
								)}
							</section>
						)}

						{studio && (
							<section className={'detail-section'} aria-labelledby="studio-title">
								<h2 id="studio-title" className={'detail-title'}>
									The studio
								</h2>
								<StudioBlock studio={studio} user={user} />
							</section>
						)}

						<CommentsSection refId={pkg._id} group={CommentGroup.PACKAGE} user={user} />
					</div>

					{device !== 'mobile' && <aside className={'detail-aside'}>{booking}</aside>}
				</div>

				{similar.length > 0 && (
					<section className={'detail-section similar'} aria-labelledby="similar-title">
						<h2 id="similar-title" className={'detail-title'}>
							Similar packages
						</h2>
						<ul className={'similar-grid'}>
							{similar.map((item) => (
								<li key={item._id}>
									<PopularPackageCard pkg={item} likePackageHandler={likePackageHandler} />
								</li>
							))}
						</ul>
					</section>
				)}
			</div>

			{device === 'mobile' && (
				<>
					<div className={'booking-bar'}>
						<div className={'bar-price'}>
							<span className={'price'}>{formatKRW(pkg.packagePrice)}</span>
							<span className={'booking-tier'}>{prettyEnum(pkg.packageType)} tier</span>
						</div>
						<button
							type="button"
							className={'button-primary'}
							aria-haspopup="dialog"
							onClick={() => setSheetOpen(true)}
						>
							Reserve
						</button>
					</div>
					<Drawer
						anchor="bottom"
						open={sheetOpen}
						onClose={() => setSheetOpen(false)}
						classes={{ paper: 'booking-sheet' }}
						PaperProps={{ role: 'dialog', 'aria-label': 'Request a reservation' } as any}
					>
						<div className={'sheet-head'}>
							<p className={'sheet-title'}>Request a reservation</p>
							<button type="button" className={'icon-btn'} aria-label="Close" onClick={() => setSheetOpen(false)}>
								<CloseRoundedIcon />
							</button>
						</div>
						{booking}
					</Drawer>
				</>
			)}
		</div>
	);
};

export default withLayoutFull(PackageDetail);
