import { useState, useEffect } from "react";
import "./App.css";
import { useAuth0 } from "@auth0/auth0-react";

const API_URL = process.env.REACT_APP_API_URL;

const useAuth0Token = () => {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      setAccessToken(await getAccessTokenSilently());
    };

    if (isAuthenticated) {
      fetchToken();
    }
  }, [isAuthenticated, user?.sub]);

  return accessToken;
};

function App() {
  const { loginWithRedirect, isAuthenticated } = useAuth0();
  const token = useAuth0Token();
  const [me, setMe] = useState(null);
  const [error, setError] = useState(null);

  const onClickLogin = () => {
    loginWithRedirect();
  };

  const onClickCall = async () => {
    try {
      // APIを呼ぶ
      const res = await fetch(`${API_URL}/v1/users/me`, {
        method: "GET",
        mode: "cors",
        headers: {
          // JWTをAuthorizationヘッダにセットする
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const me = await res.json();
      setError(null);
      setMe(me);
    } catch (error) {
      console.log("error", error);
      setError(error);
    }
  };

  return (
    <div className="App">
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "64px" }}
      >
        <button onClick={onClickLogin} disabled={isAuthenticated}>
          {isAuthenticated ? "ログイン済み" : "ログイン"}
        </button>
      </div>
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "64px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginRight: "32px",
          }}
        >
          <button onClick={onClickCall}>ユーザー情報を取得</button>
        </div>
        <div style={{ width: "300px" }}>
          <p>ユーザー: {JSON.stringify(me)}</p>
          <p>エラー: {error ? error.toString() : ""}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
