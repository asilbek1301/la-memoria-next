import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
import InquiryManager from '../../../libs/components/admin/cs/InquiryManager';

/** messages from the contact form (Help page and homepage) **/
const InquiryList: NextPage = () => <InquiryManager />;

export default withAdminLayout(InquiryList);
