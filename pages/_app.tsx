import type { AppProps } from 'next/app';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import React, { useState } from 'react';
import { light } from '../scss/MaterialTheme';
import { ApolloProvider } from '@apollo/client';
import { useApollo } from '../apollo/client';
import { appWithTranslation } from 'next-i18next';
import { bodyFont, headingFont, homeHeadingFont, koreanFont, logoFont } from '../libs/fonts';
import '../scss/app.scss';
import '../scss/pc/main.scss';
import '../scss/mobile/main.scss';

const App = ({ Component, pageProps }: AppProps) => {
	// @ts-ignore
	const [theme, setTheme] = useState(createTheme(light));
	const client = useApollo(pageProps.initialApolloState);

	return (
		<ApolloProvider client={client}>
			<style
				// next/font families as CSS variables, used by the $font / $font-heading SCSS variables
				dangerouslySetInnerHTML={{
					__html: `:root{--font-heading:${headingFont.style.fontFamily},${koreanFont.style.fontFamily};--font-body:${bodyFont.style.fontFamily},${koreanFont.style.fontFamily};--font-logo:${logoFont.style.fontFamily};--font-home-heading:${homeHeadingFont.style.fontFamily},${koreanFont.style.fontFamily};}`,
				}}
			/>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Component {...pageProps} />
			</ThemeProvider>
		</ApolloProvider>
	);
};

export default appWithTranslation(App);
