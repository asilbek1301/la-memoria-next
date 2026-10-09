import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { userVar } from '../../apollo/store';
import {
	ChatMessage,
	chatMessagesVar,
	chatOnlineVar,
	chatOpenVar,
	chatStatusVar,
	chatUnreadVar,
	connectChat,
	sendChatMessage,
	setChatOpen,
} from '../chat/chatSocket';
import { Member } from '../types/member/member';
import { memberPhoto, studioName } from './studio/studioSearch';

const MESSAGE_MAX = 500;
const NEAR_BOTTOM = 80; // px from the end that still counts as "reading the newest"
const INPUT_MAX_HEIGHT = 120; // the message box grows up to this, then scrolls

interface MessageGroup {
	key: string;
	senderId: string;
	member: Member | null;
	mine: boolean;
	texts: string[];
}

/** messages in a row from the same person share one name and photo **/
const groupMessages = (messages: ChatMessage[], myId: string) =>
	messages.reduce<MessageGroup[]>((groups, message, index) => {
		const senderId = message.memberData?._id ?? 'guest';
		const last = groups[groups.length - 1];
		if (last && last.senderId === senderId) last.texts.push(message.text);
		else
			groups.push({
				key: `${index}-${senderId}`,
				senderId,
				member: message.memberData,
				mine: Boolean(myId) && senderId === myId,
				texts: [message.text],
			});
		return groups;
	}, []);

/** the community chat: a round button in the corner and a panel with the live room. Everyone can read;
    logged-in members can write (the socket lives in libs/chat/chatSocket.ts) **/
const Chat = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const messages = useReactiveVar(chatMessagesVar);
	const online = useReactiveVar(chatOnlineVar);
	const status = useReactiveVar(chatStatusVar);
	const open = useReactiveVar(chatOpenVar);
	const unread = useReactiveVar(chatUnreadVar);
	const [draft, setDraft] = useState<string>('');
	const [newBelow, setNewBelow] = useState<boolean>(false);
	const logRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const launcherRef = useRef<HTMLButtonElement>(null);
	const closeRef = useRef<HTMLButtonElement>(null);
	const stickToBottom = useRef<boolean>(true);
	const myId = user?._id ?? '';

	/** LIFECYCLES **/

	// connect once, and again after a login or logout
	useEffect(() => connectChat(myId), [myId]);

	// opening: start at the newest message and move focus into the panel. With a mouse the cursor goes to the
	// message box; on touch screens to the close button, so the keyboard doesn't cover the chat straight away
	useEffect(() => {
		if (!open) return;
		stickToBottom.current = true;
		scrollToEnd('auto');
		const touch = window.matchMedia('(pointer: coarse)').matches;
		(touch ? closeRef.current : inputRef.current ?? closeRef.current)?.focus();
	}, [open]);

	// a new message: follow it when reading the newest, otherwise offer "New messages"
	useEffect(() => {
		if (!open) return;
		if (stickToBottom.current) scrollToEnd('smooth');
		else setNewBelow(true);
	}, [messages, open]);

	// the message box grows with its text
	useEffect(() => {
		const input = inputRef.current;
		if (!input) return;
		input.style.height = 'auto';
		input.style.height = `${Math.min(input.scrollHeight, INPUT_MAX_HEIGHT)}px`;
	}, [draft]);

	/** HANDLERS **/

	function scrollToEnd(behavior: ScrollBehavior) {
		const log = logRef.current;
		if (log) log.scrollTo({ top: log.scrollHeight, behavior });
		setNewBelow(false);
	}

	const onScroll = () => {
		const log = logRef.current;
		if (!log) return;
		stickToBottom.current = log.scrollHeight - log.scrollTop - log.clientHeight < NEAR_BOTTOM;
		if (stickToBottom.current) setNewBelow(false);
	};

	const close = () => {
		setChatOpen(false);
		launcherRef.current?.focus();
	};

	const send = (e?: React.FormEvent) => {
		e?.preventDefault();
		const text = draft.trim();
		if (!text || !sendChatMessage(text)) return;
		setDraft('');
		stickToBottom.current = true; // your own message always scrolls into view
	};

	// Enter sends, Shift+Enter adds a line; not while a Korean (or other) IME is still composing
	const onInputKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
			e.preventDefault();
			send();
		}
	};

	const groups = groupMessages(messages, myId);
	const statusText =
		status === 'open' ? `${online} online` : status === 'connecting' ? 'Connecting…' : 'Reconnecting…';

	return (
		<div className={`chat-widget ${open ? 'open' : ''}`}>
			<button
				ref={launcherRef}
				type="button"
				className={'chat-launcher'}
				aria-expanded={open}
				aria-controls="chat-panel"
				aria-label={open ? 'Close the chat' : unread ? `Open the chat (${unread} new)` : 'Open the chat'}
				onClick={() => (open ? close() : setChatOpen(true))}
			>
				{open ? <CloseRoundedIcon /> : <ChatBubbleOutlineRoundedIcon />}
				{!open && unread > 0 && <span className={'launcher-badge'}>{unread > 99 ? '99+' : unread}</span>}
			</button>

			<section
				id="chat-panel"
				className={'chat-panel'}
				role="dialog"
				aria-label="Community chat"
				aria-hidden={!open}
				onKeyDown={(e) => e.key === 'Escape' && close()}
			>
				<header className={'chat-head'}>
					<div>
						<h2 className={'chat-title'}>Community chat</h2>
						<p className={`chat-status ${status}`}>
							<span className={'status-dot'} aria-hidden="true" />
							{statusText}
						</p>
					</div>
					<button ref={closeRef} type="button" className={'chat-close'} aria-label="Close the chat" onClick={close}>
						<CloseRoundedIcon />
					</button>
				</header>

				<div className={'chat-log'} ref={logRef} role="log" aria-live="polite" onScroll={onScroll}>
					{groups.length === 0 ? (
						<p className={'chat-empty'}>No messages yet.</p>
					) : (
						groups.map((group) => {
							const name = group.member ? studioName(group.member) : 'Guest';
							const photo = memberPhoto(group.member?.memberImage);
							return (
								<div key={group.key} className={`chat-group ${group.mine ? 'mine' : ''}`}>
									{!group.mine && (
										<span className={'chat-avatar'} aria-hidden="true">
											{photo ? <img src={photo} alt="" /> : name.charAt(0)}
										</span>
									)}
									<div className={'group-body'}>
										<span className={group.mine ? 'visually-hidden' : 'chat-name'}>{group.mine ? 'You' : name}</span>
										{group.texts.map((text, index) => (
											<p key={index} className={'chat-bubble'}>
												{text}
											</p>
										))}
									</div>
								</div>
							);
						})
					)}
				</div>
				{newBelow && (
					<button type="button" className={'chat-new'} onClick={() => scrollToEnd('smooth')}>
						New messages <KeyboardArrowDownRoundedIcon />
					</button>
				)}

				<footer className={'chat-composer'}>
					{user?._id ? (
						<form className={'composer-form'} onSubmit={send}>
							<label className={'visually-hidden'} htmlFor="chat-input">
								Message
							</label>
							<textarea
								ref={inputRef}
								id="chat-input"
								rows={1}
								maxLength={MESSAGE_MAX}
								value={draft}
								placeholder="Write a message"
								onChange={(e) => setDraft(e.target.value)}
								onKeyDown={onInputKey}
							/>
							<button
								type="submit"
								className={'chat-send'}
								aria-label="Send"
								disabled={!draft.trim() || status !== 'open'}
							>
								<ArrowUpwardRoundedIcon />
							</button>
						</form>
					) : (
						<p className={'chat-login'}>
							<Link href={`/account/join?referrer=${encodeURIComponent(router.asPath)}`} className={'button-link'}>
								Log in to chat
							</Link>
						</p>
					)}
				</footer>
			</section>
		</div>
	);
};

export default Chat;
