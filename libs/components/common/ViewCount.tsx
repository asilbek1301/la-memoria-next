import React from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useTranslation } from 'next-i18next';

/** an eye and the view count, shown next to the like (heart) button; not a button itself **/
const ViewCount = ({ count, className = 'view-count' }: { count: number; className?: string }) => {
	const { t } = useTranslation('common');

	return (
		<span className={className} title={t('{{count}} views', { count })}>
			<VisibilityOutlinedIcon aria-hidden="true" />
			<span aria-hidden="true">{count.toLocaleString('en-US')}</span>
			<span className={'visually-hidden'}>{t('{{count}} views', { count })}</span>
		</span>
	);
};

export default ViewCount;
