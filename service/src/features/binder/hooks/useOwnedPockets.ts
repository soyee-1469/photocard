import { useState, useEffect } from 'react';
import { useApi } from '../../../services/api/ApiProvider';
import { type OwnedCard } from '../../../services/api/types';
import { type BinderPocket } from '../model/types';
import { buildPockets } from '../model/buildPockets';

export function useOwnedPockets() {
  const api = useApi();
  const [pockets, setPockets] = useState<BinderPocket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPockets = async () => {
    try {
      setLoading(true);
      setError(null);
      const ownedCards = await api.listOwnedCards();
      const rawCards: OwnedCard[] = ownedCards.map((view) => ({
        instanceId: view.instanceId,
        cardDefId: view.cardDef.id,
        purchaseId: '',
        acquiredAt: view.acquiredAt,
        revealedAt: view.revealedAt,
      }));
      setPockets(buildPockets(rawCards));
    } catch (err: any) {
      setError(err.message ?? '카드를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPockets();
  }, []);

  return { pockets, loading, error, reload: loadPockets };
}
