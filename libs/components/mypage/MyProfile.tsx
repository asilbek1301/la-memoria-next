import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { MemberUpdate } from '../../types/member/member.update';
import { MemberType } from '../../enums/member.enum';
import { getJwtToken, updateStorage, updateUserInfo } from '../../auth';
import { UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { sweetErrorHandling } from '../../sweetAlert';
import { Messages } from '../../config';
import { memberPhoto } from '../studio/studioSearch';

const DESC_MAX = 300;

type ProfileFields = Pick<MemberUpdate, 'memberNick' | 'memberFullName' | 'memberPhone' | 'memberAddress' | 'memberDesc' | 'memberImage'>;

/** profile form: photo, nickname, name, phone, address and an "About" text (same UPDATE_MEMBER and token refresh as before) **/
const MyProfile = () => {
	const user = useReactiveVar(userVar);
	const isStudio = user?.memberType === MemberType.STUDIO;
	const fileRef = useRef<HTMLInputElement>(null);
	const [form, setForm] = useState<ProfileFields>({});
	const [uploading, setUploading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);
	const [saved, setSaved] = useState<boolean>(false); // "Saved" on the button for a moment after saving

	/** APOLLO REQUESTS **/

	const [updateMember] = useMutation(UPDATE_MEMBER);

	/** LIFECYCLES **/

	useEffect(() => {
		setForm({
			memberNick: user.memberNick,
			memberFullName: user.memberFullName,
			memberPhone: user.memberPhone,
			memberAddress: user.memberAddress,
			memberDesc: user.memberDesc,
			// the login placeholder path is not a real photo: never send it back as one
			memberImage: memberPhoto(user.memberImage) ? user.memberImage : '',
		});
	}, [user]);

	/** HANDLERS **/

	const set = (key: keyof ProfileFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
		setForm({ ...form, [key]: e.target.value });

	// the same GraphQL multipart upload as before
	const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const image = e.target.files?.[0];
		if (!image) return;
		try {
			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'member' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', image);
			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${getJwtToken()}`,
				},
			});
			setForm((current) => ({ ...current, memberImage: response.data.data.imageUploader }));
		} catch (err) {
			await sweetErrorHandling(err);
		} finally {
			setUploading(false);
		}
	};

	useEffect(() => {
		if (!saved) return;
		const timer = setTimeout(() => setSaved(false), 2000);
		return () => clearTimeout(timer);
	}, [saved]);

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (!user._id) throw new Error(Messages.error2);
			setSaving(true);
			const input: MemberUpdate = { _id: user._id };
			(Object.keys(form) as (keyof ProfileFields)[]).forEach((key) => {
				const value = form[key]?.trim();
				if (value) (input as any)[key] = value;
			});
			// the description may be cleared on purpose
			input.memberDesc = form.memberDesc?.trim() ?? '';
			const result = await updateMember({ variables: { input } });
			const jwtToken = result.data.updateMember?.accessToken;
			await updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
			setSaved(true);
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setSaving(false);
		}
	};

	const image = memberPhoto(form.memberImage);
	const nickOk = (form.memberNick?.trim().length ?? 0) >= 3 && (form.memberNick?.trim().length ?? 0) <= 12;
	const nameOk = !form.memberFullName?.trim() || (form.memberFullName.trim().length >= 3 && form.memberFullName.trim().length <= 100);
	const canSave = nickOk && nameOk && Boolean(form.memberPhone?.trim()) && !uploading && !saving;

	return (
		<section className={'my-section'} aria-labelledby="profile-title">
			<div className={'section-row'}>
				<div>
					<h2 id="profile-title" className={'detail-title'}>
						Profile
					</h2>
					<p className={'section-note'}>
						{isStudio ? 'How your studio appears to couples.' : 'Your details for studios and other members.'}
					</p>
				</div>
			</div>

			<form className={'my-form'} onSubmit={submit}>
				<div className={'photo-field'}>
					<div className={'my-avatar large'} aria-hidden="true">
						{image ? <img src={image} alt="" /> : <span className={'arch-initial'}>{(form.memberNick ?? '?').charAt(0).toUpperCase()}</span>}
					</div>
					<div className={'photo-actions'}>
						<p className={'field-label'}>Photo</p>
						<input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" hidden onChange={uploadImage} />
						<button type="button" className={'button-secondary'} onClick={() => fileRef.current?.click()} disabled={uploading}>
							{uploading ? 'Uploading…' : image ? 'Change photo' : 'Add a photo'}
						</button>
						<p className={'field-help'}>JPG or PNG.</p>
					</div>
				</div>

				<div className={'form-grid'}>
					<label className={'field'}>
						<span className={'field-label'}>Nickname</span>
						<input value={form.memberNick ?? ''} onChange={set('memberNick')} minLength={3} maxLength={12} required />
						<span className={'field-help'}>3 to 12 characters.</span>
					</label>
					<label className={'field'}>
						<span className={'field-label'}>
							{isStudio ? 'Studio name' : 'Full name'} <span className={'field-optional'}>(optional)</span>
						</span>
						<input value={form.memberFullName ?? ''} onChange={set('memberFullName')} maxLength={100} />
						{isStudio && <span className={'field-help'}>Shown instead of your nickname.</span>}
					</label>
					<label className={'field'}>
						<span className={'field-label'}>Phone</span>
						<input type="tel" value={form.memberPhone ?? ''} onChange={set('memberPhone')} required />
					</label>
					<label className={'field'}>
						<span className={'field-label'}>Address</span>
						<input value={form.memberAddress ?? ''} onChange={set('memberAddress')} />
						{isStudio && <span className={'field-help'}>Street, district, city. For example: 12, Dosan-daero, Gangnam-gu, Seoul</span>}
					</label>
					<label className={'field wide'}>
						<span className={'field-label'}>
							About <span className={'field-optional'}>(optional)</span>
						</span>
						<textarea rows={4} maxLength={DESC_MAX} value={form.memberDesc ?? ''} onChange={set('memberDesc')} />
						<span className={'field-help'}>
							{isStudio ? 'Shown on your studio page. ' : ''}
							{(form.memberDesc ?? '').length} / {DESC_MAX}
						</span>
					</label>
				</div>

				<div className={'form-foot'}>
					<button type="submit" className={'button-primary'} disabled={!canSave}>
						{saving ? 'Saving…' : saved ? 'Saved' : 'Save changes'}
					</button>
				</div>
			</form>
		</section>
	);
};

export default MyProfile;
