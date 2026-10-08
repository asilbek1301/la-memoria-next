import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { useMutation, useQuery } from '@apollo/client';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Divider,
	IconButton,
	List,
	ListItem,
	MenuItem,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Tooltip,
	Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { GET_ALL_INQUIRIES_BY_ADMIN } from '../../../../apollo/admin/query';
import { REMOVE_INQUIRY_BY_ADMIN, UPDATE_INQUIRY_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { Inquiry } from '../../../types/inquiry/inquiry';
import { InquiryStatus } from '../../../enums/inquiry.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../sweetAlert';

type TabValue = InquiryStatus | 'ALL';

const statusTabs: { value: TabValue; label: string }[] = [
	{ value: InquiryStatus.NEW, label: 'New' },
	{ value: InquiryStatus.ANSWERED, label: 'Answered' },
	{ value: InquiryStatus.DELETE, label: 'Deleted' },
	{ value: 'ALL', label: 'All' },
];

const statusLabels: Record<InquiryStatus, string> = {
	[InquiryStatus.NEW]: 'New',
	[InquiryStatus.ANSWERED]: 'Answered',
	[InquiryStatus.DELETE]: 'Deleted',
};

const replyHref = (inquiry: Inquiry) =>
	`mailto:${inquiry.inquiryEmail}?subject=${encodeURIComponent('Re: your message to La Memoria')}`;

/** one status tab, with its own count (limit 1, the total only) **/
const StatusTab = (props: { value: TabValue; label: string; active: boolean; refreshKey: number; onClick: () => void }) => {
	const { value, label, active, refreshKey, onClick } = props;
	const { data, refetch } = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 1, search: value === 'ALL' ? {} : { inquiryStatus: value } } },
	});
	useEffect(() => {
		if (refreshKey) refetch();
	}, [refreshKey, refetch]);
	const count: number = data?.getAllInquiriesByAdmin?.metaCounter?.[0]?.total ?? 0;
	return (
		<ListItem onClick={onClick} className={active ? 'li on' : 'li'}>
			{label} ({count})
		</ListItem>
	);
};

/** the contact form inbox: read a message, reply from your email app, mark it answered **/
const InquiryManager = () => {
	const [tab, setTab] = useState<TabValue>(InquiryStatus.NEW);
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(20);
	const [open, setOpen] = useState<Inquiry | null>(null);
	const [refreshKey, setRefreshKey] = useState<number>(0);
	const input = { page, limit, search: tab === 'ALL' ? {} : { inquiryStatus: tab } };

	/** APOLLO REQUESTS **/

	const [updateInquiryByAdmin] = useMutation(UPDATE_INQUIRY_BY_ADMIN);
	const [removeInquiryByAdmin] = useMutation(REMOVE_INQUIRY_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_INQUIRIES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input },
		notifyOnNetworkStatusChange: true,
	});
	const inquiries: Inquiry[] = data?.getAllInquiriesByAdmin?.list ?? [];
	const total: number = data?.getAllInquiriesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/

	const reload = async () => {
		await refetch({ input });
		setRefreshKey((key) => key + 1);
	};

	const statusHandler = async (inquiry: Inquiry, inquiryStatus: InquiryStatus) => {
		try {
			await updateInquiryByAdmin({ variables: { input: { _id: inquiry._id, inquiryStatus } } });
			if (open?._id === inquiry._id) setOpen({ ...open, inquiryStatus });
			await reload();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeHandler = async (inquiry: Inquiry) => {
		try {
			if (!(await sweetConfirmAlert('Remove this message for good? This cannot be undone.'))) return;
			await removeInquiryByAdmin({ variables: { input: inquiry._id } });
			await reload();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	return (
		<Box component={'div'} className={'content'}>
			<Typography variant={'h2'} className={'tit'} sx={{ mb: '8px' }}>
				1:1 Inquiry
			</Typography>
			<Typography sx={{ mb: '24px', color: '#757575', fontSize: '14px' }}>
				Messages from the contact form on the Help page and the homepage. Reply from your email, then mark the message
				answered.
			</Typography>

			<Box component={'div'} className={'table-wrap'}>
				<List className={'tab-menu'}>
					{statusTabs.map((item) => (
						<StatusTab
							key={item.value}
							value={item.value}
							label={item.label}
							active={tab === item.value}
							refreshKey={refreshKey}
							onClick={() => {
								setTab(item.value);
								setPage(1);
							}}
						/>
					))}
				</List>
				<Divider />

				<TableContainer>
					<Table sx={{ minWidth: 750 }} aria-label="Messages">
						<TableHead>
							<TableRow>
								<TableCell>From</TableCell>
								<TableCell>Message</TableCell>
								<TableCell>Received</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{inquiries.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} align="center">
										<span className={'no-data'}>No messages here.</span>
									</TableCell>
								</TableRow>
							) : (
								inquiries.map((inquiry) => (
									<TableRow hover key={inquiry._id}>
										<TableCell sx={{ width: 240 }}>
											<Typography sx={{ fontWeight: 500, fontSize: '15px' }}>{inquiry.inquiryName}</Typography>
											<a href={replyHref(inquiry)} style={{ color: '#757575', fontSize: '13px' }}>
												{inquiry.inquiryEmail}
											</a>
										</TableCell>
										<TableCell sx={{ maxWidth: 420 }}>
											<Typography
												sx={{ fontSize: '14px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
											>
												{inquiry.inquiryMessage}
											</Typography>
										</TableCell>
										<TableCell>
											<Moment format="YYYY-MM-DD HH:mm">{inquiry.createdAt}</Moment>
										</TableCell>
										<TableCell>
											<Select
												size="small"
												value={inquiry.inquiryStatus}
												onChange={(e) => statusHandler(inquiry, e.target.value as InquiryStatus)}
												inputProps={{ 'aria-label': `Status of the message from ${inquiry.inquiryName}` }}
											>
												{Object.values(InquiryStatus).map((status) => (
													<MenuItem key={status} value={status}>
														{statusLabels[status]}
													</MenuItem>
												))}
											</Select>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="View">
												<IconButton aria-label={`View the message from ${inquiry.inquiryName}`} onClick={() => setOpen(inquiry)}>
													<VisibilityOutlinedIcon />
												</IconButton>
											</Tooltip>
											{inquiry.inquiryStatus === InquiryStatus.DELETE && (
												<Tooltip title="Remove for good">
													<IconButton aria-label={`Remove the message from ${inquiry.inquiryName}`} onClick={() => removeHandler(inquiry)}>
														<DeleteForeverOutlinedIcon />
													</IconButton>
												</Tooltip>
											)}
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</TableContainer>

				<TablePagination
					rowsPerPageOptions={[20, 40, 60]}
					component="div"
					count={total}
					rowsPerPage={limit}
					page={page - 1}
					onPageChange={(e, next) => setPage(next + 1)}
					onRowsPerPageChange={(e) => {
						setLimit(parseInt(e.target.value, 10));
						setPage(1);
					}}
				/>
			</Box>

			<Dialog open={Boolean(open)} onClose={() => setOpen(null)} fullWidth maxWidth="sm">
				<DialogTitle>Message from {open?.inquiryName}</DialogTitle>
				<DialogContent>
					<Typography sx={{ color: '#757575', fontSize: '14px', mb: '16px' }}>
						{open?.inquiryEmail} · <Moment format="YYYY-MM-DD HH:mm">{open?.createdAt}</Moment> ·{' '}
						{open ? statusLabels[open.inquiryStatus] : ''}
						{open?.memberId ? ' · sent while logged in' : ''}
					</Typography>
					<Typography sx={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: 1.7 }}>{open?.inquiryMessage}</Typography>
				</DialogContent>
				<DialogActions sx={{ p: '16px 24px' }}>
					<Button onClick={() => setOpen(null)}>Close</Button>
					{open && open.inquiryStatus !== InquiryStatus.ANSWERED && (
						<Button onClick={() => statusHandler(open, InquiryStatus.ANSWERED)}>Mark answered</Button>
					)}
					{open && (
						<Button variant="contained" href={replyHref(open)}>
							Reply by email
						</Button>
					)}
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default InquiryManager;
