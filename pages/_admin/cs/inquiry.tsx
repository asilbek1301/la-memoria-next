import React from 'react';
import type { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import InquiryManager from '../../../libs/components/admin/cs/InquiryManager';

/** messages from the contact form (Help page and homepage) **/
const InquiryList: NextPage = () => <InquiryManager />;

export default withAdminLayout(InquiryList);
