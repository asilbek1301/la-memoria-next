import React, { useEffect } from 'react';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import Head from 'next/head';
import Top from '../Top';
import Footer from '../Footer';
import { Stack } from '@mui/material';
import { getJwtToken, updateUserInfo } from '../../auth';
import Chat from '../Chat';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

/** shared header, chat and footer, no banner; pass { footer: false } to leave the footer out (log in page) **/
const withLayoutFull = (Component: any, { footer = true }: { footer?: boolean } = {}) => {
	const LayoutFull = (props: any) => {
		const device = useDeviceDetect();

		/** LIFECYCLES **/
		useEffect(() => {
			const jwt = getJwtToken();
			if (jwt) updateUserInfo(jwt);
		}, []);

		/** HANDLERS **/

		if (device == 'mobile') {
			return (
				<>
					<Head>
						<title>La Memoria</title>
						<meta name={'title'} content={`La Memoria`} />
					</Head>
					<Stack id="mobile-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						{footer && (
							<Stack id={'footer'}>
								<Footer />
							</Stack>
						)}
					</Stack>
				</>
			);
		} else {
			return (
				<>
					<Head>
						<title>La Memoria</title>
						<meta name={'title'} content={`La Memoria`} />
					</Head>
					<Stack id="pc-wrap">
						<Stack id={'top'}>
							<Top />
						</Stack>

						<Stack id={'main'}>
							<Component {...props} />
						</Stack>

						<Chat />

						{footer && (
							<Stack id={'footer'}>
								<Footer />
							</Stack>
						)}
					</Stack>
				</>
			);
		}
	};
	return LayoutFull;
};

export default withLayoutFull;
