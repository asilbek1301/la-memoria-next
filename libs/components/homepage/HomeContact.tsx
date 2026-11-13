import React from 'react';
import { useTranslation } from 'next-i18next';
import HomeSection from './HomeSection';
import ContactForm from '../common/ContactForm';
import { SUPPORT_PHONE, SUPPORT_TEL } from '../cs/helpContent';

/** "Write to us" before the footer: the same contact form as the Help page (messages reach the admin inbox) **/
const HomeContact = () => {
	const { t } = useTranslation('common');

	return (
		<HomeSection
			id="contact"
			title={t('Write to us')}
			subtitle={t(
				'Questions about a package, a studio or your reservation? Send us a message and we will reply by email.',
			)}
			tone="tinted"
			className={'home-contact'}
		>
			<div className={'home-contact-grid'}>
				<div className={'contact-form-panel'}>
					<ContactForm idPrefix="home-contact" />
				</div>
				<aside className={'home-contact-aside'} aria-label={t('Other ways to reach us')}>
					<p className={'aside-label'}>{t('Prefer to call?')}</p>
					<a className={'aside-phone'} href={SUPPORT_TEL}>
						{SUPPORT_PHONE}
					</a>
					<p className={'aside-text'}>{t('Quick answers about packages, reservations and payments are in Help.')}</p>
					<a className={'button-link'} href={'/cs?tab=faq'}>
						{t('Read the FAQ')}
					</a>
				</aside>
			</div>
		</HomeSection>
	);
};

export default HomeContact;
