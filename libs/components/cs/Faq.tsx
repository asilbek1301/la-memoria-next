import React, { SyntheticEvent, useState } from 'react';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import { AccordionDetails, Box, Stack, Typography } from '@mui/material';
import MuiAccordionSummary, { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import { styled } from '@mui/material/styles';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

const Accordion = styled((props: AccordionProps) => <MuiAccordion disableGutters elevation={0} square {...props} />)(
	({ theme }) => ({
		border: `1px solid ${theme.palette.divider}`,
		'&:not(:last-child)': {
			borderBottom: 0,
		},
		'&:before': {
			display: 'none',
		},
	}),
);
const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary expandIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: '1.4rem' }} />} {...props} />
))(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, .05)' : '#fff',
	'& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
		transform: 'rotate(180deg)',
	},
	'& .MuiAccordionSummary-content': {
		marginLeft: theme.spacing(1),
	},
}));

const Faq = () => {
	const device = useDeviceDetect();
	const [category, setCategory] = useState<string>('package');
	const [expanded, setExpanded] = useState<string | false>('panel1');

	/** APOLLO REQUESTS **/
	/** LIFECYCLES **/
	
	/** HANDLERS **/
	const changeCategoryHandler = (category: string) => {
		setCategory(category);
	};

	const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
		setExpanded(newExpanded ? panel : false);
	};

	const data: any = {
		package: [
			{
				id: '00f5a45ed8897f8090116a01',
				subject: 'Are the packages displayed on the site reliable?',
				content: 'Yes. Every package is published by a registered studio and can be reviewed by couples after the shoot.',
			},
			{
				id: '00f5a45ed8897f8090116a22',
				subject: 'What types of packages do you offer?',
				content: 'Packages come in three tiers (Pearl, Gold and Diamond) and four styles: Classic, Modern, Vintage and Romantic.',
			},
			{
				id: '00f5a45ed8897f8090116a21',
				subject: 'How can I search for packages on your website?',
				content: 'Use the search bar and filters to choose location, package type, style, edited photo count, shoot duration and price range.',
			},
			{
				id: '00f5a45ed8897f8090116a23',
				subject: 'What is included in a package?',
				content: 'Each package lists its shoot duration, number of edited photos and whether an album, dress and makeup are included.',
			},
			{
				id: '00f5a45ed8897f8090116a24',
				subject: 'What should I consider when choosing a package?',
				content: 'Compare the studio portfolio, style, shoot duration, number of edited photos and the extras included.',
			},
			{
				id: '00f5a45ed8897f8090116a25',
				subject: 'How far in advance should we reserve?',
				content: 'We recommend reserving 1 to 3 months before your preferred date, especially for spring and autumn weekends.',
			},
			{
				id: '00f5a45ed8897f8090116a29',
				subject: 'What happens if there is an issue after the shoot?',
				content: 'Contact the studio first; if it is not resolved, our support team will help mediate.',
			},
			{
				id: '00f5a45ed8897f8090116a28',
				subject: 'Do you offer packages in specific cities?',
				content: 'Yes, packages are available in Seoul, Busan, Incheon, Daegu, Gyeongju, Gwangju, Chonju, Daejon and Jeju.',
			},
			{
				id: '00f5a45ed8897f8090116a27',
				subject: 'Can I save packages to compare later?',
				content: 'Yes, like a package to add it to Saved Packages in My Page.',
			},
			{
				id: '00f5a45ed8897f8090116b99',
				subject: 'Can a package be paused?',
				content: 'Studios may temporarily pause a package; paused packages are hidden from search until reactivated.',
			},
		],
		payment: [
			{
				id: '00f5a45ed8897f8090116a02',
				subject: 'How can I make the payment?',
				content: 'Payment is arranged directly with the studio.',
			},
			{
				id: '00f5a45ed8897f8090116a91',
				subject: 'Are there any additional fees for using your services?',
				content: 'No, browsing and reserving are free for couples.',
			},
			{
				id: '00f5a45ed8897f8090116a92',
				subject: 'Is there an option for installment payments?',
				content: 'Yes, we offer installment payment plans for certain packages. Please inquire for more details.',
			},
			{
				id: '00f5a45ed8897f8090116a93',
				subject: 'Is my payment information secure on your website?',
				content:
					'Yes, we use industry-standard encryption technology to ensure the security of your payment information.',
			},
			{
				id: '00f5a45ed8897f8090116a94',
				subject: 'Can I make payments online through your website?',
				content: "Yes, you can securely make payments online through our website's payment portal.",
			},
			{
				id: '00f5a45ed8897f8090116a95',
				subject: "What happens if there's an issue with my payment?",
				content: 'If you encounter any issues with your payment, please contact our support team for assistance.',
			},
			{
				id: '00f5a45ed8897f8090116a96',
				subject: 'Do you offer refunds for payments made?',
				content:
					'Refund policies vary depending on the circumstances. Please refer to our refund policy or contact us for more information.',
			},
			{
				id: '00f5a45ed8897f8090116a97',
				subject: 'Are there any discounts or incentives for early payments?',
				content:
					'We occasionally offer discounts or incentives for early payments. Check our promotions or contact us for current offers.',
			},
			{
				id: '00f5a45ed8897f8090116a99',
				subject: 'How long does it take for payments to be processed?',
				content:
					'Payment processing times vary depending on the payment method used. Typically, credit/debit card payments are processed instantly',
			},
			{
				id: '00f5a45ed8897f8090116a98',
				subject: 'Are there penalties for late payments?',
				content:
					'Late payment penalties may apply depending on the terms of your agreement. Please refer to your contract or contact us for details.',
			},
		],
		buyers: [
			{
				id: '00f5a45ed8897f8090116a03',
				subject: 'What should couples pay attention to?',
				content: 'Check the studio portfolio, reviews and exactly what the package includes before reserving.',
			},
			{
				id: '00f5a45ed8897f8090116a85',
				subject: 'How can I find a package within my budget?',
				content: 'Use the price range filter on the package search page to see packages within your budget.',
			},
			{
				id: '00f5a45ed8897f8090116a84',
				subject: 'What information do I need to make a reservation?',
				content: 'Pick a date, add an optional note for the studio, and submit the reservation from the package page.',
			},
			{
				id: '00f5a45ed8897f8090116a83',
				subject: 'How will I know my reservation is confirmed?',
				content: 'The status in My Reservations changes from Pending to Confirmed once the studio accepts it.',
			},
			{
				id: '00f5a45ed8897f8090116a82',
				subject: 'Can I cancel a reservation?',
				content: 'Yes, pending or confirmed reservations can be cancelled from My Reservations.',
			},
			{
				id: '00f5a45ed8897f8090116a81',
				subject: 'Can we bring our own dress or makeup artist?',
				content: 'If the package does not include dress or makeup, you can usually bring your own; confirm with the studio in your reservation note.',
			},
			{
				id: '00f5a45ed8897f8090116a80',
				subject: 'Can we choose an outdoor location?',
				content: 'Many studios offer outdoor shoots; check the package description or ask the studio.',
			},
			{
				id: '00f5a45ed8897f8090116a79',
				subject: 'How long until we receive the edited photos?',
				content: 'Delivery times vary by studio; most deliver edited photos within 2 to 6 weeks.',
			},
			{
				id: '00f5a45ed8897f8090116a78',
				subject: 'Can I follow a studio?',
				content: 'Yes, follow a studio to keep track of its new packages.',
			},
			{
				id: '00f5a45ed8897f8090116a77',
				subject: 'Can I leave a review after the shoot?',
				content: 'Yes, you can leave comments on the package and studio pages.',
			},
		],

		studios: [
			{
				id: '00f5a45ed8897f8090116a04',
				subject: 'How do I become a studio on La Memoria?',
				content: 'Sign up and choose the Studio account type, then complete your studio profile.',
			},
			{
				id: '00f5a45ed8897f8090116a62',
				subject: 'How do I publish a package?',
				content: 'Go to My Page, choose Add Package, fill in the package details, upload photos and save.',
			},
			{
				id: '00f5a45ed8897f8090116a63',
				subject: 'What do the package statuses mean?',
				content: 'Active packages are visible in search, Paused and Hold packages are hidden, and Deleted packages are removed.',
			},
			{
				id: '00f5a45ed8897f8090116a64',
				subject: 'How do I manage reservations?',
				content: 'Open Reservations in My Page to confirm, complete or cancel couple reservations.',
			},
			{
				id: '00f5a45ed8897f8090116a65',
				subject: 'How can I attract more couples?',
				content: 'Use high quality sample photos, a clear description and competitive pricing.',
			},
			{
				id: '00f5a45ed8897f8090116a66',
				subject: 'Can I edit a package after publishing?',
				content: 'Yes, edit any non-deleted package from My Packages.',
			},
			{
				id: '00f5a45ed8897f8090116a67',
				subject: 'How is the package rank calculated?',
				content: 'Rank is based on package views and likes and is refreshed regularly.',
			},
			{
				id: '00f5a45ed8897f8090116a68',
				subject: 'How should I handle difficult situations with couples?',
				content: 'Communicate clearly, document agreements in the reservation note, and contact support if needed.',
			},
			{
				id: '00f5a45ed8897f8090116a69',
				subject: 'Can I upload more than five photos?',
				content: 'Each upload supports up to five images; choose your strongest work.',
			},
			{
				id: '00f5a45ed8897f8090116a70',
				subject: 'How do I stay visible on the homepage?',
				content: 'Popular and top packages are chosen by views, likes and rank, so keep your packages active and up to date.',
			},
		],
		membership: [
			{
				id: '00f5a45ed8897f8090116a05',
				subject: 'Do you have a membership service on your site?',
				content: 'membership service is not available on our site yet!',
			},
			{
				id: '00f5a45ed8897f8090116a60',
				subject: 'What are the benefits of becoming a member on your website?',
				content: 'We currently do not offer membership benefits, but stay tuned for updates on any future offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a59',
				subject: 'Is there a fee associated with becoming a member?',
				content: 'As membership services are not available, there are no associated fees at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a58',
				subject: 'Will membership provide access to exclusive content or features?',
				content: "We don't currently have membership-exclusive content or features.",
			},
			{
				id: '00f5a45ed8897f8090116a57',
				subject: 'How can I sign up for a membership on your site?',
				content: 'As of now, we do not have a sign-up process for memberships.',
			},
			{
				id: '00f5a45ed8897f8090116a56',
				subject: 'Do members receive discounts on packages or services?',
				content: 'Membership discounts are not part of our current offerings.',
			},
			{
				id: '00f5a45ed8897f8090116a55',
				subject: 'Are there plans to introduce a membership program in the future?',
				content:
					"While we can't confirm any plans at this time, we're always exploring ways to enhance our services for users.",
			},
			{
				id: '00f5a45ed8897f8090116a54',
				subject: 'What kind of content or benefits can members expect if a membership program is introduced?',
				content: "We're evaluating potential benefits and features, but specifics are not available yet.",
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Do you offer a premium membership option on your platform?',
				content: 'Currently, we do not provide a premium membership option.',
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Will membership grant access to exclusive deals or discounts?',
				content: 'Membership perks, including deals or discounts, are not available at this time.',
			},
		],
		community: [
			{
				id: '00f5a45ed8897f8090116a06',
				subject: 'What should I do if there is abusive or criminal behavior in the community section?',
				content: 'If you encounter this situation, please report it immediately or contact the admin!',
			},
			{
				id: '00f5a45ed8897f8090116a44',
				subject: 'How can I participate in the community section of your website?',
				content: 'Create an account and engage in discussions.',
			},
			{
				id: '00f5a45ed8897f8090116a45',
				subject: 'Are there guidelines for posting?',
				content: 'Yes, follow our community guidelines.',
			},
			{
				id: '00f5a45ed8897f8090116a46',
				subject: 'What should I do if I encounter spam or irrelevant posts?',
				content: 'Report them to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a47',
				subject: 'Can I connect with other members outside of the community section?',
				content: 'Currently, no.',
			},
			{
				id: '00f5a45ed8897f8090116a48',
				subject: 'Can I share personal experiences or recommendations?',
				content: 'Yes, if relevant you can share personal experiences and recommendations.',
			},
			{
				id: '00f5a45ed8897f8090116a49',
				subject: 'How can I ensure privacy?',
				content: 'Avoid sharing sensitive information.',
			},
			{
				id: '00f5a45ed8897f8090116a50',
				subject: 'How can I contribute positively?',
				content: 'Respect others and engage constructively.',
			},
			{
				id: '00f5a45ed8897f8090116a51',
				subject: 'What if I notice misinformation?',
				content: 'Provide correct information or report to the admin.',
			},
			{
				id: '00f5a45ed8897f8090116a52',
				subject: 'Are there moderators?',
				content: 'Yes, we have moderators.',
			},
		],
		other: [
			{
				id: '00f5a45ed8897f8090116a40',
				subject: 'Who should I contact if I want to buy your site?',
				content: 'We have no plans to sell the site at this time!',
			},
			{
				id: '00f5a45ed8897f8090116a39',
				subject: 'Can I advertise my services on your website?',
				content: 'We currently do not offer advertising opportunities on our site.',
			},
			{
				id: '00f5a45ed8897f8090116a38',
				subject: 'Are there sponsorship opportunities available on your platform?',
				content: 'At this time, we do not have sponsorship opportunities.',
			},
			{
				id: '00f5a45ed8897f8090116a36',
				subject: 'Can I contribute guest posts or articles to your website?',
				content: "We're not accepting guest posts or articles at the moment.",
			},
			{
				id: '00f5a45ed8897f8090116a35',
				subject: 'Is there a referral program for recommending your website to others?',
				content: "We don't have a referral program in place currently.",
			},
			{
				id: '00f5a45ed8897f8090116a34',
				subject: 'Do you offer affiliate partnerships for promoting your services?',
				content: 'Affiliate partnerships are not available at this time.',
			},
			{
				id: '00f5a45ed8897f8090116a33',
				subject: 'Can I purchase merchandise related to your website?',
				content: "We don't have merchandise available for purchase.",
			},
			{
				id: '00f5a45ed8897f8090116a32',
				subject: 'Are there any job openings or opportunities to work with your team?',
				content: 'Currently, we do not have any job openings or opportunities available.',
			},
			{
				id: '00f5a45ed8897f8090116a31',
				subject: 'Do you host wedding fairs or events?',
				content: "We're not hosting events or webinars at this time.",
			},
			{
				id: '00f5a45ed8897f8090116a30',
				subject: 'Can I request custom features or functionalities for your website?',
				content: "We're not accepting requests for custom features or functionalities.",
			},
		],
	};

	if (device === 'mobile') {
		return <div>FAQ MOBILE</div>;
	} else {
		return (
			<Stack className={'faq-content'}>
				<Box className={'categories'} component={'div'}>
					<div
						className={category === 'package' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('package');
						}}
					>
						Package
					</div>
					<div
						className={category === 'payment' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('payment');
						}}
					>
						Payment
					</div>
					<div
						className={category === 'buyers' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('buyers');
						}}
					>
						For Couples
					</div>
					<div
						className={category === 'studios' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('studios');
						}}
					>
						For Studios
					</div>
					<div
						className={category === 'membership' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('membership');
						}}
					>
						Membership
					</div>
					<div
						className={category === 'community' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('community');
						}}
					>
						Community
					</div>
					<div
						className={category === 'other' ? 'active' : ''}
						onClick={() => {
							changeCategoryHandler('other');
						}}
					>
						Other
					</div>
				</Box>
				<Box className={'wrap'} component={'div'}>
					{data[category] &&
						data[category].map((ele: any) => (
							<Accordion expanded={expanded === ele?.id} onChange={handleChange(ele?.id)} key={ele?.subject}>
								<AccordionSummary id="panel1d-header" className="question" aria-controls="panel1d-content">
									<Typography className="badge" variant={'h4'}>
										Q
									</Typography>
									<Typography> {ele?.subject}</Typography>
								</AccordionSummary>
								<AccordionDetails>
									<Stack className={'answer flex-box'}>
										<Typography className="badge" variant={'h4'} color={'primary'}>
											A
										</Typography>
										<Typography> {ele?.content}</Typography>
									</Stack>
								</AccordionDetails>
							</Accordion>
						))}
				</Box>
			</Stack>
		);
	}
};

export default Faq;
