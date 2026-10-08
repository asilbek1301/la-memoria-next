import React from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import CallOutlinedIcon from '@mui/icons-material/CallOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { userVar } from '../../../apollo/store';
import ContactForm from '../common/ContactForm';
import { SUPPORT_PHONE, SUPPORT_TEL } from './helpContent';

const RESERVATIONS_HREF = '/mypage?category=myReservations';

/** the contact form (messages reach the admin inbox), with the phone line and your reservations beside it **/
const Contact = () => {
	const user = useReactiveVar(userVar);
	const reservationsHref = user?._id ? RESERVATIONS_HREF : `/account/join?referrer=${encodeURIComponent(RESERVATIONS_HREF)}`;

	return (
		<section className={'help-contact'} aria-labelledby="contact-title">
			<div className={'section-head'}>
				<h2 id="contact-title" className={'section-title'}>
					Contact us
				</h2>
			</div>
			<div className={'contact-layout'}>
				<div className={'contact-form-panel'}>
					<h3 className={'panel-title'}>Send us a message</h3>
					<p className={'panel-text'}>Ask about a package, a studio or your reservation. We reply by email.</p>
					<ContactForm idPrefix="help-contact" />
				</div>
				<ul className={'contact-list'}>
					<li className={'contact-card lead'}>
						<span className={'contact-icon'} aria-hidden="true">
							<CallOutlinedIcon />
						</span>
						<p className={'contact-label'}>Call us</p>
						<a className={'contact-phone'} href={SUPPORT_TEL}>
							{SUPPORT_PHONE}
						</a>
						<p className={'contact-text'}>For questions about La Memoria, a package or a studio.</p>
					</li>
					<li className={'contact-card'}>
						<span className={'contact-icon'} aria-hidden="true">
							<EventNoteOutlinedIcon />
						</span>
						<p className={'contact-label'}>Your reservations</p>
						<p className={'contact-text'}>See each request and its status, or cancel it, in My Page.</p>
						<Link href={reservationsHref} className={'button-link'}>
							Open my reservations
						</Link>
					</li>
				</ul>
			</div>
		</section>
	);
};

export default Contact;
