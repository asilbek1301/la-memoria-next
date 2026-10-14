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
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextField,
	Tooltip,
	Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { GET_ALL_NOTICES_BY_ADMIN } from '../../../../apollo/admin/query';
import { CREATE_NOTICE, REMOVE_NOTICE_BY_ADMIN, UPDATE_NOTICE_BY_ADMIN } from '../../../../apollo/admin/mutation';
import { Notice } from '../../../types/notice/notice';
import { AllNoticesInquiry } from '../../../types/notice/notice.input';
import { NoticeCategory, NoticeStatus, NoticeTopic } from '../../../enums/notice.enum';
import { Direction } from '../../../enums/common.enum';
import { sweetConfirmAlert, sweetErrorHandling } from '../../../sweetAlert';
import { helpTopics, topicLabel } from '../../cs/helpContent';

// the backend's limits (NoticeInput)
const TITLE_MIN = 3;
const TITLE_MAX = 150;
const CONTENT_MIN = 3;
const CONTENT_MAX = 3000;

const statusTabs: { value: NoticeStatus | 'ALL'; label: string }[] = [
	{ value: 'ALL', label: 'All' },
	{ value: NoticeStatus.ACTIVE, label: 'Active' },
	{ value: NoticeStatus.HOLD, label: 'Hold' },
	{ value: NoticeStatus.DELETE, label: 'Deleted' },
];

interface Draft {
	_id?: string;
	noticeTitle: string;
	noticeContent: string;
	noticeTopic: NoticeTopic | '';
}

const emptyDraft: Draft = { noticeTitle: '', noticeContent: '', noticeTopic: '' };

/** one status tab, with its own count (limit 1, the total only) **/
const StatusTab = (props: {
	category: NoticeCategory;
	value: NoticeStatus | 'ALL';
	label: string;
	active: boolean;
	refreshKey: number;
	onClick: () => void;
}) => {
	const { category, value, label, active, refreshKey, onClick } = props;
	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: {
			input: { page: 1, limit: 1, search: value === 'ALL' ? { noticeCategory: category } : { noticeCategory: category, noticeStatus: value } },
		},
	});
	// recount after an add, edit, status change or removal
	useEffect(() => {
		if (refreshKey) refetch();
	}, [refreshKey, refetch]);
	const count: number = data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;
	return (
		<ListItem onClick={onClick} className={active ? 'li on' : 'li'}>
			{label} ({count})
		</ListItem>
	);
};

/** admin list for Help content: notices or FAQ. Add, edit, hold, delete and remove; the Help page shows Active items **/
const NoticeManager = ({ category, title }: { category: NoticeCategory; title: string }) => {
	const isFaq = category === NoticeCategory.FAQ;
	const [inquiry, setInquiry] = useState<AllNoticesInquiry>({
		page: 1,
		limit: 20,
		sort: 'createdAt',
		// FAQ in reading order (as the Help page shows it); notices newest first
		direction: isFaq ? Direction.ASC : Direction.DESC,
		search: { noticeCategory: category },
	});
	const [draft, setDraft] = useState<Draft | null>(null);
	const [saving, setSaving] = useState<boolean>(false);
	const [refreshKey, setRefreshKey] = useState<number>(0);

	/** APOLLO REQUESTS **/

	const [createNotice] = useMutation(CREATE_NOTICE);
	const [updateNoticeByAdmin] = useMutation(UPDATE_NOTICE_BY_ADMIN);
	const [removeNoticeByAdmin] = useMutation(REMOVE_NOTICE_BY_ADMIN);
	const { data, refetch } = useQuery(GET_ALL_NOTICES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: inquiry },
		notifyOnNetworkStatusChange: true,
	});
	const notices: Notice[] = data?.getAllNoticesByAdmin?.list ?? [];
	const total: number = data?.getAllNoticesByAdmin?.metaCounter?.[0]?.total ?? 0;

	/** HANDLERS **/

	const reload = async () => {
		await refetch({ input: inquiry });
		setRefreshKey((key) => key + 1); // recounts the status tabs
	};

	const setSearch = (search: AllNoticesInquiry['search']) => setInquiry({ ...inquiry, page: 1, search });

	const statusTabHandler = (value: NoticeStatus | 'ALL') => {
		const search = { ...inquiry.search };
		if (value === 'ALL') delete search.noticeStatus;
		else search.noticeStatus = value;
		setSearch(search);
	};

	const topicFilterHandler = (value: NoticeTopic | 'ALL') => {
		const search = { ...inquiry.search };
		if (value === 'ALL') delete search.noticeTopic;
		else search.noticeTopic = value;
		setSearch(search);
	};

	const statusHandler = async (notice: Notice, noticeStatus: NoticeStatus) => {
		try {
			await updateNoticeByAdmin({ variables: { input: { _id: notice._id, noticeStatus } } });
			await reload();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const removeHandler = async (notice: Notice) => {
		try {
			if (!(await sweetConfirmAlert('Remove this for good? This cannot be undone.'))) return;
			await removeNoticeByAdmin({ variables: { input: notice._id } });
			await reload();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		}
	};

	const titleLength = draft?.noticeTitle.trim().length ?? 0;
	const contentLength = draft?.noticeContent.trim().length ?? 0;
	const draftInvalid =
		!draft ||
		titleLength < TITLE_MIN ||
		titleLength > TITLE_MAX ||
		contentLength < CONTENT_MIN ||
		contentLength > CONTENT_MAX ||
		(isFaq && !draft.noticeTopic);

	const saveHandler = async () => {
		if (!draft || draftInvalid) return;
		try {
			setSaving(true);
			const fields = {
				noticeTitle: draft.noticeTitle.trim(),
				noticeContent: draft.noticeContent.trim(),
				...(isFaq ? { noticeTopic: draft.noticeTopic } : {}),
			};
			if (draft._id) await updateNoticeByAdmin({ variables: { input: { _id: draft._id, ...fields } } });
			else await createNotice({ variables: { input: { noticeCategory: category, ...fields } } });
			setDraft(null);
			await reload();
		} catch (err: any) {
			sweetErrorHandling(err).then();
		} finally {
			setSaving(false);
		}
	};

	const activeTab = inquiry.search.noticeStatus ?? 'ALL';

	return (
		<Box component={'div'} className={'content'}>
			<Box component={'div'} className={'title flex_space'}>
				<Typography variant={'h2'}>{title}</Typography>
				<Button className="btn_add" variant={'contained'} size={'medium'} onClick={() => setDraft({ ...emptyDraft })}>
					<AddRoundedIcon sx={{ mr: '8px' }} />
					ADD
				</Button>
			</Box>
			<Typography sx={{ mb: '24px', color: '#757575', fontSize: '14px' }}>
				Active items are shown on the Help page{isFaq ? ' under their topic' : ', newest first'}. Hold hides an item; Deleted items
				can be removed for good.
			</Typography>

			<Box component={'div'} className={'table-wrap'}>
				<List className={'tab-menu'}>
					{statusTabs.map((tab) => (
						<StatusTab
							key={tab.value}
							category={category}
							value={tab.value}
							label={tab.label}
							active={activeTab === tab.value}
							refreshKey={refreshKey}
							onClick={() => statusTabHandler(tab.value)}
						/>
					))}
				</List>
				<Divider />
				{isFaq && (
					<>
						<Stack className={'search-area'} sx={{ m: '24px' }}>
							<Select
								sx={{ width: '220px' }}
								value={inquiry.search.noticeTopic ?? 'ALL'}
								onChange={(e) => topicFilterHandler(e.target.value as NoticeTopic | 'ALL')}
								inputProps={{ 'aria-label': 'Filter by topic' }}
							>
								<MenuItem value={'ALL'}>All topics</MenuItem>
								{helpTopics.map((item) => (
									<MenuItem key={item.topic} value={item.topic}>
										{item.label}
									</MenuItem>
								))}
							</Select>
						</Stack>
						<Divider />
					</>
				)}

				<TableContainer>
					<Table sx={{ minWidth: 750 }} aria-label={title}>
						<TableHead>
							<TableRow>
								<TableCell>Title</TableCell>
								{isFaq && <TableCell>Topic</TableCell>}
								<TableCell>Created</TableCell>
								<TableCell>Status</TableCell>
								<TableCell align="right">Actions</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{notices.length === 0 ? (
								<TableRow>
									<TableCell colSpan={isFaq ? 5 : 4} align="center">
										<span className={'no-data'}>Nothing here yet. Use ADD to write the first one.</span>
									</TableCell>
								</TableRow>
							) : (
								notices.map((notice) => (
									<TableRow hover key={notice._id}>
										<TableCell sx={{ maxWidth: 520 }}>
											<Typography sx={{ fontWeight: 500, fontSize: '15px' }}>{notice.noticeTitle}</Typography>
											<Typography
												sx={{
													color: '#757575',
													fontSize: '13px',
													overflow: 'hidden',
													textOverflow: 'ellipsis',
													whiteSpace: 'nowrap',
												}}
											>
												{notice.noticeContent}
											</Typography>
										</TableCell>
										{isFaq && <TableCell>{topicLabel(notice.noticeTopic) || '—'}</TableCell>}
										<TableCell>
											<Moment format="YYYY-MM-DD">{notice.createdAt}</Moment>
										</TableCell>
										<TableCell>
											<Select
												size="small"
												value={notice.noticeStatus}
												onChange={(e) => statusHandler(notice, e.target.value as NoticeStatus)}
												inputProps={{ 'aria-label': `Status of ${notice.noticeTitle}` }}
											>
												<MenuItem value={NoticeStatus.ACTIVE}>Active</MenuItem>
												<MenuItem value={NoticeStatus.HOLD}>Hold</MenuItem>
												<MenuItem value={NoticeStatus.DELETE}>Deleted</MenuItem>
											</Select>
										</TableCell>
										<TableCell align="right">
											<Tooltip title="Edit">
												<IconButton
													aria-label={`Edit ${notice.noticeTitle}`}
													onClick={() =>
														setDraft({
															_id: notice._id,
															noticeTitle: notice.noticeTitle,
															noticeContent: notice.noticeContent,
															noticeTopic: notice.noticeTopic ?? '',
														})
													}
												>
													<EditOutlinedIcon />
												</IconButton>
											</Tooltip>
											{notice.noticeStatus === NoticeStatus.DELETE && (
												<Tooltip title="Remove for good">
													<IconButton aria-label={`Remove ${notice.noticeTitle}`} onClick={() => removeHandler(notice)}>
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
					rowsPerPage={inquiry.limit}
					page={inquiry.page - 1}
					onPageChange={(e, page) => setInquiry({ ...inquiry, page: page + 1 })}
					onRowsPerPageChange={(e) => setInquiry({ ...inquiry, page: 1, limit: parseInt(e.target.value, 10) })}
				/>
			</Box>

			<Dialog open={Boolean(draft)} onClose={() => !saving && setDraft(null)} fullWidth maxWidth="md">
				<DialogTitle>{draft?._id ? 'Edit' : 'Add'} {isFaq ? 'question' : 'notice'}</DialogTitle>
				<DialogContent>
					<Stack spacing={3} sx={{ pt: 1 }}>
						{isFaq && (
							<Select
								value={draft?.noticeTopic ?? ''}
								displayEmpty
								onChange={(e) => draft && setDraft({ ...draft, noticeTopic: e.target.value as NoticeTopic })}
								inputProps={{ 'aria-label': 'Topic' }}
							>
								<MenuItem value={''} disabled>
									Choose a topic
								</MenuItem>
								{helpTopics.map((item) => (
									<MenuItem key={item.topic} value={item.topic}>
										{item.label}
									</MenuItem>
								))}
							</Select>
						)}
						<TextField
							label={isFaq ? 'Question' : 'Title'}
							value={draft?.noticeTitle ?? ''}
							inputProps={{ maxLength: TITLE_MAX }}
							helperText={`${titleLength} / ${TITLE_MAX}`}
							onChange={(e) => draft && setDraft({ ...draft, noticeTitle: e.target.value })}
						/>
						<TextField
							label={isFaq ? 'Answer' : 'Text'}
							value={draft?.noticeContent ?? ''}
							multiline
							minRows={6}
							// the theme fixes outlined inputs at 48px; a multi-line answer needs to grow
							sx={{ '& .MuiOutlinedInput-root': { height: 'auto', alignItems: 'flex-start' } }}
							inputProps={{ maxLength: CONTENT_MAX }}
							helperText={`${contentLength} / ${CONTENT_MAX}. Line breaks are kept.`}
							onChange={(e) => draft && setDraft({ ...draft, noticeContent: e.target.value })}
						/>
					</Stack>
				</DialogContent>
				<DialogActions sx={{ p: '16px 24px' }}>
					<Button onClick={() => setDraft(null)} disabled={saving}>
						Cancel
					</Button>
					<Button variant="contained" onClick={saveHandler} disabled={draftInvalid || saving}>
						{saving ? 'Saving…' : 'Save'}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default NoticeManager;
