import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../libs/components/layout/LayoutAdmin';
import AdminDashboard from '../../libs/components/admin/AdminDashboard';

/** the admin home: an overview instead of a redirect to Users **/
const AdminHome: NextPage = () => <AdminDashboard />;

export default withAdminLayout(AdminHome);
