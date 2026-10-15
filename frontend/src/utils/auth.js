
export function logout() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");

  window.location.replace("/login");
}

export function scheduleTokenExpiry(token) {
  if (!token) {
    logout();
    return;
  }

  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    if (!payload.exp) {
      logout();
      return;
    }

    const remainingTime = payload.exp * 1000 - Date.now();

    if (remainingTime <= 0) {
      logout();
      return;
    }

    window.setTimeout(() => {
      logout();
    }, Math.min(remainingTime, 2147483647));
  } catch {
    logout();
  }
}
