import rawAxios from 'axios';
import { useMemo, useRef, useState, useEffect, useContext, useCallback, createContext } from 'react';

import { CONFIG } from 'src/global-config';

import { ServiceUnavailableView } from 'src/sections/error/service-unavailable-view';

// ----------------------------------------------------------------------

const HEALTH_CHECK_TIMEOUT = 5000;
const RETRY_INTERVAL = 15000;

export const SERVER_DOWN_EVENT = 'server:down';

const ServerHealthContext = createContext({ status: 'healthy' });

export const useServerHealth = () => useContext(ServerHealthContext);

// ----------------------------------------------------------------------

export function ServerHealthProvider({ children }) {
  const [status, setStatus] = useState('healthy'); // 'healthy' | 'unhealthy'
  const retryTimerRef = useRef(null);

  const checkHealth = useCallback(async () => {
    try {
      await rawAxios.get(`${CONFIG.serverUrl}/api/health`, {
        timeout: HEALTH_CHECK_TIMEOUT,
        validateStatus: () => true,
      });
      setStatus('healthy');
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    } catch {
      setStatus('unhealthy');
    }
  }, []);

  const startRetryPolling = useCallback(() => {
    if (!retryTimerRef.current) {
      retryTimerRef.current = setInterval(checkHealth, RETRY_INTERVAL);
    }
  }, [checkHealth]);

  // axios 인터셉터에서 발생시킨 커스텀 이벤트 수신
  useEffect(() => {
    const handleServerDown = () => {
      setStatus('unhealthy');
      startRetryPolling();
    };

    window.addEventListener(SERVER_DOWN_EVENT, handleServerDown);
    return () => {
      window.removeEventListener(SERVER_DOWN_EVENT, handleServerDown);
      if (retryTimerRef.current) {
        clearInterval(retryTimerRef.current);
      }
    };
  }, [startRetryPolling]);

  const retry = useCallback(() => {
    checkHealth();
  }, [checkHealth]);

  const value = useMemo(() => ({ status }), [status]);

  if (status === 'unhealthy') {
    return (
      <ServerHealthContext.Provider value={value}>
        <ServiceUnavailableView onRetry={retry} retryInterval={RETRY_INTERVAL} />
      </ServerHealthContext.Provider>
    );
  }

  return <ServerHealthContext.Provider value={value}>{children}</ServerHealthContext.Provider>;
}
