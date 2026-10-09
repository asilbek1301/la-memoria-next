import { makeVar } from '@apollo/client';
import { Member } from '../types/member/member';
import { getJwtToken } from '../auth';

/**
 * The community chat's one WebSocket (backend: apps/la-memoria-api/src/socket/socket.gateway.ts).
 * It lives outside React, so changing pages keeps the same connection; Chat.tsx reads the reactive vars below.
 *
 * Server → client: { event: 'info', totalClients } · { event: 'getMessages', list } (the last 5) · { event: 'message', text, memberData }
 * Client → server: { event: 'message', data: text } (logged-in members only; the server ignores guests)
 **/

export interface ChatMessage {
	text: string;
	/** the sender as the server knows them; null for an old guest message */
	memberData: Member | null;
}

export type ChatStatus = 'connecting' | 'open' | 'reconnecting';

const WS_URL = process.env.REACT_APP_API_WS ?? 'ws://127.0.0.1:3007';
const RETRY_MS = [1000, 2000, 5000, 10000]; // waits between reconnect attempts, the last one repeats
const KEEP_MESSAGES = 100; // how many messages this tab keeps

export const chatMessagesVar = makeVar<ChatMessage[]>([]);
export const chatOnlineVar = makeVar<number>(0);
export const chatStatusVar = makeVar<ChatStatus>('connecting');
export const chatOpenVar = makeVar<boolean>(false);
/** messages from others that arrived while the panel was closed */
export const chatUnreadVar = makeVar<number>(0);

let socket: WebSocket | null = null;
let token = ''; // the login token the socket was opened with ('' = guest)
let memberId = ''; // the logged-in member, to tell their own messages apart
let retry = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;

const onMessage = (event: MessageEvent) => {
	let data: any;
	try {
		data = JSON.parse(event.data);
	} catch {
		return;
	}
	if (data.event === 'info') chatOnlineVar(data.totalClients ?? 0);
	if (data.event === 'getMessages') chatMessagesVar(data.list ?? []);
	if (data.event === 'message') {
		const message: ChatMessage = { text: data.text, memberData: data.memberData ?? null };
		chatMessagesVar([...chatMessagesVar(), message].slice(-KEEP_MESSAGES));
		const fromOthers = !memberId || message.memberData?._id !== memberId;
		if (!chatOpenVar() && fromOthers) chatUnreadVar(chatUnreadVar() + 1);
	}
};

const open = () => {
	clearTimeout(retryTimer);
	chatStatusVar(retry === 0 ? 'connecting' : 'reconnecting');
	const current = new WebSocket(`${WS_URL}?token=${token}`);
	socket = current;
	current.onopen = () => {
		retry = 0;
		chatStatusVar('open');
	};
	current.onmessage = onMessage;
	current.onclose = () => {
		if (socket !== current) return; // replaced on purpose (login / logout): nothing to retry
		chatStatusVar('reconnecting');
		retryTimer = setTimeout(open, RETRY_MS[Math.min(retry++, RETRY_MS.length - 1)]);
	};
};

/** connects with the saved login token. Calling it again with the same token does nothing; a login or logout
    (a new token) reconnects, so the server knows who is writing. `id` is the logged-in member ('' for a guest) **/
export const connectChat = (id: string) => {
	if (typeof window === 'undefined') return;
	memberId = id;
	const current = getJwtToken() ?? '';
	if (socket && current === token) return;
	token = current;
	retry = 0;
	const previous = socket;
	socket = null;
	previous?.close();
	open();
};

/** sends one message; false when the connection is not open **/
export const sendChatMessage = (text: string): boolean => {
	if (socket?.readyState !== WebSocket.OPEN) return false;
	socket.send(JSON.stringify({ event: 'message', data: text }));
	return true;
};

export const setChatOpen = (value: boolean) => {
	chatOpenVar(value);
	if (value) chatUnreadVar(0);
};
