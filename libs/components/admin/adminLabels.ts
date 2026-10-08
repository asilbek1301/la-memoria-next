import { MemberStatus, MemberType } from '../../enums/member.enum';
import { prettyEnum } from '../../utils';

/** readable words for enum values in the admin tables ("ACTIVE" -> "Active", "USER" -> "Couple") **/
export const memberTypeLabel = (type?: string) =>
	type === MemberType.USER ? 'Couple' : type === MemberType.STUDIO ? 'Studio' : prettyEnum(type);

export const statusLabel = (status?: string) => (status === 'DELETE' ? 'Deleted' : status === 'BLOCK' ? 'Blocked' : prettyEnum(status));

/** badge colour by meaning: live = green, waiting or paused = amber, blocked or cancelled = red, deleted = grey **/
export const statusBadge = (status?: string) => {
	switch (status) {
		case 'ACTIVE':
		case 'CONFIRMED':
		case 'COMPLETED':
		case 'ANSWERED':
			return 'badge success';
		case 'PENDING':
		case 'PAUSE':
		case 'HOLD':
		case 'NEW':
			return 'badge warning';
		case MemberStatus.BLOCK:
		case 'CANCELLED':
			return 'badge error';
		default:
			return 'badge delete';
	}
};

export const memberHref = (member?: { _id?: string; memberType?: string }) =>
	member?.memberType === MemberType.STUDIO ? `/studio/detail?studioId=${member?._id}` : `/member?memberId=${member?._id}`;
