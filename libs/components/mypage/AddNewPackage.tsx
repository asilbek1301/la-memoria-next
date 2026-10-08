import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useMutation, useQuery } from '@apollo/client';
import { PackageLocation, PackageStyle, PackageType } from '../../enums/package.enum';
import { REACT_APP_API_URL, packageDurations, packagePhotosList } from '../../config';
import { PackageInput } from '../../types/package/package.input';
import { getJwtToken } from '../../auth';
import { sweetErrorHandling, sweetMixinErrorAlert, sweetMixinSuccessAlert } from '../../sweetAlert';
import { CREATE_PACKAGE, UPDATE_PACKAGE } from '../../../apollo/user/mutation';
import { GET_PACKAGE } from '../../../apollo/user/query';
import { prettyEnum } from '../../utils';

const MAX_PHOTOS = 5;

const emptyPackage: any = {
	packageTitle: '',
	packagePrice: 0,
	packageType: '',
	packageLocation: '',
	packageAddress: '',
	packageStyle: '',
	packageDuration: 0,
	packagePhotos: 0,
	packageAlbum: false,
	packageDress: false,
	packageMakeup: false,
	packageDesc: '',
	packageImages: [],
};

const includes: { key: 'packageAlbum' | 'packageDress' | 'packageMakeup'; label: string }[] = [
	{ key: 'packageAlbum', label: 'Album' },
	{ key: 'packageDress', label: 'Dress' },
	{ key: 'packageMakeup', label: 'Hair & makeup' },
];

/** create or edit a package (?packageId= edits); same CREATE_PACKAGE / UPDATE_PACKAGE and image upload as before **/
const AddPackage = () => {
	const router = useRouter();
	const packageId = typeof router.query.packageId === 'string' ? router.query.packageId : '';
	const fileRef = useRef<HTMLInputElement>(null);
	const [data, setData] = useState<PackageInput>(emptyPackage);
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/

	const [createPackage] = useMutation(CREATE_PACKAGE);
	const [updatePackage] = useMutation(UPDATE_PACKAGE);
	const { data: packageData } = useQuery(GET_PACKAGE, {
		fetchPolicy: 'network-only',
		variables: { input: packageId },
		skip: !packageId,
	});
	const editing = packageData?.getPackage;

	/** LIFECYCLES **/

	useEffect(() => {
		if (!editing) {
			setData(emptyPackage);
			return;
		}
		setData({
			packageTitle: editing.packageTitle,
			packagePrice: editing.packagePrice,
			packageType: editing.packageType,
			packageLocation: editing.packageLocation,
			packageAddress: editing.packageAddress,
			packageStyle: editing.packageStyle,
			packageAlbum: editing.packageAlbum,
			packageDress: editing.packageDress,
			packageMakeup: editing.packageMakeup,
			packageDuration: editing.packageDuration,
			packagePhotos: editing.packagePhotos,
			packageDesc: editing.packageDesc,
			packageImages: editing.packageImages,
		});
	}, [editing]);

	/** HANDLERS **/

	const set = (key: keyof PackageInput, value: any) => setData((current) => ({ ...current, [key]: value }));

	// the same GraphQL multipart upload as before (up to 5 files; the new set replaces the old one)
	const uploadImages = async () => {
		const files = fileRef.current?.files;
		if (!files || files.length === 0) return;
		try {
			if (files.length > MAX_PHOTOS) throw new Error(`Choose up to ${MAX_PHOTOS} photos.`);
			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImagesUploader($files: [Upload!]!, $target: String!) {
						imagesUploader(files: $files, target: $target)
					}`,
					variables: { files: [null, null, null, null, null], target: 'package' },
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.files.0'],
					'1': ['variables.files.1'],
					'2': ['variables.files.2'],
					'3': ['variables.files.3'],
					'4': ['variables.files.4'],
				}),
			);
			Array.from(files).forEach((file, index) => formData.append(`${index}`, file));
			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${getJwtToken()}`,
				},
			});
			set('packageImages', response.data.data.imagesUploader);
		} catch (err: any) {
			await sweetMixinErrorAlert(err.message);
		} finally {
			setUploading(false);
			if (fileRef.current) fileRef.current.value = '';
		}
	};

	const missing =
		(data.packageTitle?.trim().length ?? 0) < 3 ||
		!data.packagePrice ||
		!data.packageType ||
		!data.packageLocation ||
		(data.packageAddress?.trim().length ?? 0) < 3 ||
		!data.packageStyle ||
		!data.packageDuration ||
		!data.packagePhotos ||
		(data.packageDesc?.trim().length ?? 0) < 5 ||
		data.packageImages.length === 0;

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (missing || saving) return;
		try {
			setSaving(true);
			if (editing) {
				await updatePackage({ variables: { input: { ...data, _id: editing._id } } });
				await sweetMixinSuccessAlert('Your package is updated');
			} else {
				await createPackage({ variables: { input: data } });
				await sweetMixinSuccessAlert('Your package is published');
			}
			await router.push({ pathname: '/mypage', query: { category: 'myPackages' } });
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setSaving(false);
		}
	};

	return (
		<section className={'my-section'} aria-labelledby="add-title">
			<div className={'section-row'}>
				<div>
					<h2 id="add-title" className={'detail-title'}>
						{editing ? 'Edit package' : 'Add a package'}
					</h2>
					<p className={'section-note'}>Everything here is shown to couples on the package page.</p>
				</div>
				<Link href={{ pathname: '/mypage', query: { category: 'myPackages' } }} className={'button-link'}>
					Back to my packages
				</Link>
			</div>

			<form className={'my-form'} onSubmit={submit}>
				<fieldset className={'form-group'}>
					<legend className={'group-title'}>Basics</legend>
					<div className={'form-grid'}>
						<label className={'field wide'}>
							<span className={'field-label'}>Title</span>
							<input
								value={data.packageTitle}
								maxLength={100}
								required
								placeholder="For example: Jeju Coast Sunset Snap"
								onChange={(e) => set('packageTitle', e.target.value)}
							/>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>Tier</span>
							<select value={data.packageType} required onChange={(e) => set('packageType', e.target.value)}>
								<option value="">Choose a tier</option>
								{Object.values(PackageType).map((value) => (
									<option key={value} value={value}>
										{prettyEnum(value)}
									</option>
								))}
							</select>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>Style</span>
							<select value={data.packageStyle} required onChange={(e) => set('packageStyle', e.target.value)}>
								<option value="">Choose a style</option>
								{Object.values(PackageStyle).map((value) => (
									<option key={value} value={value}>
										{prettyEnum(value)}
									</option>
								))}
							</select>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>Price (₩)</span>
							<input
								type="number"
								min={0}
								step={10000}
								inputMode="numeric"
								value={data.packagePrice || ''}
								required
								onChange={(e) => set('packagePrice', Number(e.target.value))}
							/>
						</label>
					</div>
				</fieldset>

				<fieldset className={'form-group'}>
					<legend className={'group-title'}>Location</legend>
					<div className={'form-grid'}>
						<label className={'field'}>
							<span className={'field-label'}>City</span>
							<select value={data.packageLocation} required onChange={(e) => set('packageLocation', e.target.value)}>
								<option value="">Choose a city</option>
								{Object.values(PackageLocation).map((value) => (
									<option key={value} value={value}>
										{prettyEnum(value)}
									</option>
								))}
							</select>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>Place</span>
							<input
								value={data.packageAddress}
								maxLength={100}
								required
								placeholder="For example: Gwangalli Beach, Suyeong-gu, Busan"
								onChange={(e) => set('packageAddress', e.target.value)}
							/>
						</label>
					</div>
				</fieldset>

				<fieldset className={'form-group'}>
					<legend className={'group-title'}>The shoot</legend>
					<div className={'form-grid'}>
						<label className={'field'}>
							<span className={'field-label'}>Duration</span>
							<select
								value={data.packageDuration || ''}
								required
								onChange={(e) => set('packageDuration', Number(e.target.value))}
							>
								<option value="">Choose hours</option>
								{packageDurations
									.filter((hours) => hours > 0)
									.map((hours) => (
										<option key={hours} value={hours}>
											{hours} {hours === 1 ? 'hour' : 'hours'}
										</option>
									))}
							</select>
						</label>
						<label className={'field'}>
							<span className={'field-label'}>Edited photos</span>
							<select value={data.packagePhotos || ''} required onChange={(e) => set('packagePhotos', Number(e.target.value))}>
								<option value="">Choose a number</option>
								{packagePhotosList.map((count) => (
									<option key={count} value={count}>
										{count} photos
									</option>
								))}
							</select>
						</label>
						<div className={'field wide'}>
							<span className={'field-label'}>Includes</span>
							<div className={'check-row'}>
								{includes.map((item) => (
									<label key={item.key} className={`check-chip ${data[item.key] ? 'active' : ''}`}>
										<input type="checkbox" checked={Boolean(data[item.key])} onChange={(e) => set(item.key, e.target.checked)} />
										{item.label}
									</label>
								))}
							</div>
						</div>
					</div>
				</fieldset>

				<fieldset className={'form-group'}>
					<legend className={'group-title'}>Description</legend>
					<label className={'field'}>
						<span className={'field-label'}>About this package</span>
						<textarea
							rows={6}
							maxLength={500}
							required
							value={data.packageDesc ?? ''}
							onChange={(e) => set('packageDesc', e.target.value)}
						/>
						<span className={'field-help'}>{(data.packageDesc ?? '').length} / 500</span>
					</label>
				</fieldset>

				<fieldset className={'form-group'}>
					<legend className={'group-title'}>Photos</legend>
					<p className={'field-help'}>Up to {MAX_PHOTOS} photos. The first one is the cover. A new upload replaces the current photos.</p>
					{data.packageImages.length > 0 && (
						<ul className={'photo-previews'}>
							{data.packageImages.map((image, index) => (
								<li key={image}>
									<img src={`${REACT_APP_API_URL}/${image}`} alt={`Photo ${index + 1}`} />
									{index === 0 && <span className={'cover-tag'}>Cover</span>}
								</li>
							))}
						</ul>
					)}
					<input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" multiple hidden onChange={uploadImages} />
					<button type="button" className={'button-secondary'} disabled={uploading} onClick={() => fileRef.current?.click()}>
						{uploading ? 'Uploading…' : data.packageImages.length ? 'Replace photos' : 'Choose photos'}
					</button>
				</fieldset>

				<div className={'form-foot'}>
					{missing && <p className={'field-help'}>Fill in every field and add at least one photo.</p>}
					<button type="submit" className={'button-primary'} disabled={missing || saving}>
						{saving ? 'Saving…' : editing ? 'Save changes' : 'Publish package'}
					</button>
				</div>
			</form>
		</section>
	);
};

export default AddPackage;
