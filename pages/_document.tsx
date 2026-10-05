import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<meta name="robots" content="index,follow" />
				<link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

				{/* SEO */}
				<meta name="keyword" content={'la memoria, wedding photoshoot, wedding studio, pre-wedding, korea wedding photography'} />
				<meta
					name={'description'}
					content={
						'Find and book wedding photoshoot packages from the best studios in South Korea on La Memoria | ' +
						'Находите и бронируйте пакеты свадебной фотосъёмки от лучших студий Южной Кореи на La Memoria | ' +
						'La Memoria에서 대한민국 최고의 스튜디오 웨딩 촬영 패키지를 찾고 예약하세요'
					}
				/>
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
