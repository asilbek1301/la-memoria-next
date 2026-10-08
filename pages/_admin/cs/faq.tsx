import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import NoticeManager from '../../../libs/components/admin/cs/NoticeManager';
import { NoticeCategory } from '../../../libs/enums/notice.enum';

/** FAQ shown on the Help page (/cs?tab=faq) **/
const AdminFaq: NextPage = () => <NoticeManager category={NoticeCategory.FAQ} title={'FAQ Management'} />;

export default withAdminLayout(AdminFaq);
