import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});
import AdminDashboard from '../../libs/components/admin/AdminDashboard';

/** the admin home: an overview instead of a redirect to Users **/
const AdminHome: NextPage = () => <AdminDashboard />;

export default withAdminLayout(AdminHome);
