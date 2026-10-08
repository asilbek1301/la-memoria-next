import React from 'react';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { plural } from '../studio/studioSearch';

/** an eye and the view count, shown next to the like (heart) button; not a button itself **/
const ViewCount = ({ count, className = 'view-count' }: { count: number; className?: string }) => (
	<span className={className} title={plural(count, 'view')}>
		<VisibilityOutlinedIcon aria-hidden="true" />
		<span aria-hidden="true">{count.toLocaleString('en-US')}</span>
		<span className={'visually-hidden'}>{plural(count, 'view')}</span>
	</span>
);

export default ViewCount;
