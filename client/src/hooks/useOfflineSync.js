import { useState, useEffect, useCallback } from 'react';

const QUEUE_KEY = 'gym_offline_queue';

export function useOfflineSync(apiCall) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueSize, setQueueSize] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for SW sync message
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_OFFLINE_QUEUE') {
          syncQueue();
        }
      });
    }

    // Load queue size
    const queue = getQueue();
    setQueueSize(queue.length);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  function getQueue() {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    setQueueSize(queue.length);
  }

  const addToQueue = useCallback((request) => {
    const queue = getQueue();
    queue.push({
      ...request,
      id: Date.now(),
      timestamp: new Date().toISOString()
    });
    saveQueue(queue);
  }, []);

  const syncQueue = useCallback(async () => {
    if (!apiCall || syncing) return;

    const queue = getQueue();
    if (queue.length === 0) return;

    setSyncing(true);
    const failed = [];

    for (const request of queue) {
      try {
        await apiCall(request.endpoint, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined
        });
      } catch (error) {
        console.error('Failed to sync request:', error);
        failed.push(request);
      }
    }

    saveQueue(failed);
    setSyncing(false);

    if (failed.length === 0 && queue.length > 0) {
      console.log(`Synced ${queue.length} offline requests`);
    }
  }, [apiCall, syncing]);

  const queuedFetch = useCallback(async (endpoint, options = {}) => {
    if (!navigator.onLine) {
      // Queue the request
      addToQueue({
        endpoint,
        method: options.method || 'GET',
        body: options.body ? JSON.parse(options.body) : null
      });

      // Return a mock success response for writes
      if (options.method && options.method !== 'GET') {
        return {
          ok: true,
          queued: true,
          json: async () => ({ queued: true, message: 'Guardado localmente' })
        };
      }

      throw new Error('Sin conexión');
    }

    return apiCall(endpoint, options);
  }, [apiCall, addToQueue]);

  return {
    isOnline,
    queueSize,
    syncing,
    queuedFetch,
    syncQueue
  };
}
