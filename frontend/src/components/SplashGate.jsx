import { useEffect, useRef, useState } from "react";

import api from "../api/axios.js";

const MIN_DISPLAY_MS = 1400;   // avoids a flash-of-splash on fast, warm starts
const SLOW_THRESHOLD_MS = 5000; // past this, cold start is likely — reassure instead of looking frozen
const MAX_WAIT_MS = 45000;    // never trap the user indefinitely if the backend is genuinely down

export default function SplashGate({ children }) {
    const [ready, setReady] = useState(false);
    const [slow, setSlow] = useState(false);
    const startedAt = useRef(Date.now());

    useEffect(() => {
        let cancelled = false;

        const finish = () => {
            const elapsed = Date.now() - startedAt.current;
            const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
            setTimeout(() => {
                if (!cancelled) setReady(true);
            }, remaining);
        };

        const slowTimer = setTimeout(() => {
            if (!cancelled) setSlow(true);
        }, SLOW_THRESHOLD_MS);

        // Safety net: if the health check hangs entirely, don't block the app
        // forever — let the user through to normal per-request error handling.
        const maxTimer = setTimeout(finish, MAX_WAIT_MS);

        api
            .get("/health")
            .catch(() => { }) // failure here isn't fatal — just stop waiting and let them in
            .finally(() => {
                clearTimeout(slowTimer);
                clearTimeout(maxTimer);
                finish();
            });

        return () => {
            cancelled = true;
            clearTimeout(slowTimer);
            clearTimeout(maxTimer);
        };
    }, []);

    if (ready) return children;

    return (
        <div className="splash-screen">
            <img
                src="/logo.svg"
                alt=""
                className="splash-logo"
                width="64"
                height="64"
            />
            <h1 className="splash-title">Smart Day Planner</h1>
            <p className="splash-message">
                {slow ? "Waking up the server, this can take a bit…" : "Loading…"}
            </p>
        </div>
    );
}