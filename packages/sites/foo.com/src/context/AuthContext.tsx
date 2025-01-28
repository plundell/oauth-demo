"use client";
/**
 * @module AuthContext
 * 
 * This module provides a React context and provider component to handle authentication state
 * across the application. It uses cookies to persist authentication state and provides
 * methods for logging in and out.
 * 
 * The authentication state is kept in sync with a JWT cookie through a polling mechanism
 * that checks for cookie changes every second. This allows the auth state to stay 
 * synchronized even when the cookie is modified by other tabs or server-side code.
 * 
 */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';


/**
 * @constant {string} cookieName - Name of the cookie used to store the JWT token
 * //TODO: sync this with backend so it's guaranteed to be the same
 */
const cookieName = "jwt";


interface AuthContextType {
	isAuthenticated: boolean;
	login: () => void;
	logout: () => void;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component to wrap around parts of the app that need access to auth
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const fakeLogin = () => {
		document.cookie = `${cookieName}=fake-jwt-token; path=/;`;
	};

	/**
	 * Checks if the user has a JWT cookie. 
	 * 
	 * NOTE: we don't actually validate it, that's up to the backend when we ask for stuff.
	 * 
	 * @returns True if the user has a JWT cookie, false otherwise
	 */
	const hasJwtCookie = () => {
		const cookies = document.cookie.split(';');
		console.log("cookies", cookies);
		return cookies.some(cookie => cookie.trim().startsWith(`${cookieName}=`));
	}

	//We're going to be using a crude interval to check if the cookie has changed in order to tie
	//the cookie state to the login state.
	useEffect(() => {
		//To avoid having to look for our cookie on every interval we start by just checking if 
		//any cookie has changed...
		var lastCookies = "boythatitalianfamilyatthenexttablesureitquiet"; //random, so the first check will always run.
		const checkAuthStatus = () => {
			if (lastCookies !== document.cookie) {
				lastCookies = document.cookie;
				//...and if so we check if our cookie has changed...
				if (hasJwtCookie() != isAuthenticated) {
					//...and if so we update the login state.
					console.log('JWT cookie changed! We are currently ' + (!isAuthenticated ? 'LOGGED IN!' : 'NOT logged in'));
					setIsAuthenticated(!isAuthenticated);
					//NOTE: this effect is dependent on the auth state, so ^ will
					//cause the effect to run again.
				}
			}
		};

		// Check auth status on mount
		checkAuthStatus();

		// Set up an interval to check for cookie changes. This will run until isAuthenticated 
		// is changed (but that'll just cause it to unset), or until this component is unmounted 
		const intervalId = setInterval(checkAuthStatus, 1000);

		// Clean up the interval on unmount
		return () => clearInterval(intervalId);
	}, [isAuthenticated]);


	const login = () => {
		console.log("login fn called");

		// Open a new window pointing to the start-oauth endpoint, storing the window in a variable
		// so we can monitor it....
		const popup = window.open(`/api/auth/start-oauth`, 'OAuth', 'popup,width=500,height=600');

		if (!popup) {
			console.log("popup failed to open. redirecting this window instead");
			//If the popup window failed to open then all we can do is redirect the entire
			//window to the start-oauth endpoint which will effectively end execution here.
			window.location.href = "/api/auth/start-oauth";
		} else if (popup.closed) {
			console.log("popup opened but severed connection, just waiting patiently");
			//If the connection to is was severed due to Cross-Origin-Opener-Policy that still
			//means the popup is open (we just can't see it) so we'll simply have to let the 
			//user close it henself
		} else {
			console.log("popup opened successfully. monitoring it to navigate to the referer URL");
			//This should be the default case. We'll monitor the popup window's URL until it
			//navigates to the referer URL... which is where we currently are.
			const refererUrl = window.location.href;
			const intervalId = setInterval(() => {
				try {
					// Check if the popup window has navigated to the referer URL
					if (popup.location.href === refererUrl) {
						// Clear the interval
						clearInterval(intervalId);
						// Close the popup window
						popup.close();
						if (hasJwtCookie()) {
							console.log("popup has navigated to the referer URL! Big success!");
							setIsAuthenticated(true);
						} else {
							console.warn("popup has navigated to the referer URL but no JWT cookie is currently set.");
							setIsAuthenticated(false);
						}

					}
				} catch (error) {
					// Ignore cross-origin errors
				}
			}, 1000);
		}

		//Since checkAuthStatus() is monitoring the cookies, we don't need to do anything here. We'll
		//just wait for the jwt cookie to be set which should set isAuthenticated=true
	};

	const logout = () => {
		console.log("logout");
		// We log out simply by removing the JWT cookie
		document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
	};

	return (
		<AuthContext.Provider value={{ isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the AuthContext with a fallback to a dummy context which issues warnings
// if we try to use it outside of the AuthProvider.
export const useAuthContext = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		console.error("You're trying to use AuthContext outside of the AuthProvider. Returning dummy context instead.");
		return {
			get isAuthenticated() { console.warn("dummy auth check. you're not inside auth context"); return false },
			login: () => { console.warn("dummy login. you're not inside auth context") },
			logout: () => { console.warn("dummy logout. you're not inside auth context") }
		} as AuthContextType;
	}
	return context;
};