import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

/** notices shown on the Help page (/cs?tab=notice) **/
const AdminNotice: NextPage = () => <NoticeManager category={NoticeCategory.NOTICE} title={'Notice Management'} />;

export default withAdminLayout(AdminNotice);
