import React, {useState, useEffect, useCallback} from 'react';

let logoutTimer;

const AuthContext = React.createContext( {
    token: '',
    isLoggedIn: false,
    login: (token) => {},
    logout: () => {}
});

const calRemTime = (expirationTime) => {
    const currentTime = new Date().getTime();
    const adjExpTime = new Date(expirationTime).getTime();

    const remDuration = adjExpTime - currentTime;

    return remDuration;
}

const retrieveStoredToken = () => {
    const storedToken = localStorage.getItem('token');
    const storedExpDate = localStorage.getItem('expirationTime');

    const remTime = calRemTime(storedExpDate);

    if (remTime <= 3600) {
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');
        return null;
    }
    return {token: storedToken, duration: remTime};
}

export const AuthContextProvider = (props) => {

    const tokenData = retrieveStoredToken();

    let initialToken;
    if (tokenData) {
        initialToken = tokenData.token;
    }

    const [token, setToken] = useState(initialToken);

    const userIsLoggedIn = !!token;

    const logoutHandler = useCallback(() => {
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('expirationTime');

        if (logoutTimer) {
            clearTimeout(logoutTimer);
        }

    },[]);

    const loginHandler = (token, expirationTime) => {
        setToken(token)
        localStorage.setItem('token', token);
        localStorage.setItem('expirationTime', expirationTime);
        
        const remTime = calRemTime(expirationTime);

        logoutTimer = setTimeout(logoutHandler, remTime)
    
    };

    useEffect(() => {
        if (tokenData) {
            console.log(tokenData.duration)
            logoutTimer = setTimeout(logoutHandler, tokenData.duration)
        }
    }, [tokenData, logoutHandler])

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        login: loginHandler,
        logout: logoutHandler
    };


    return <AuthContext.Provider value={contextValue}>{props.children}</AuthContext.Provider>
}
export default AuthContext;