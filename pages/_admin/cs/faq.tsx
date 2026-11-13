import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

/** FAQ shown on the Help page (/cs?tab=faq) **/
const AdminFaq: NextPage = () => <NoticeManager category={NoticeCategory.FAQ} title={'FAQ Management'} />;

export default withAdminLayout(AdminFaq);
