import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getSecureItem, setSecureItem, SECURE_KEYS } from '@/lib/secureStorage';

export type BeneficiaryRelationship = 'Filho' | 'Mulher' | 'Outro';

export type Beneficiary = {
  id: string;
  relationship: BeneficiaryRelationship;
  fullName: string;
  document: string;
};

type UseBeneficiariesOptions = {
  userIdForStorage: string;
  isDemoMode: boolean;
  userId?: string | null;
};

export function useBeneficiaries({ userIdForStorage, isDemoMode, userId }: UseBeneficiariesOptions) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [beneficiaryModalVisible, setBeneficiaryModalVisible] = useState(false);
  const [beneficiarySaving, setBeneficiarySaving] = useState(false);
  const [beneficiaryEditingId, setBeneficiaryEditingId] = useState<string | null>(null);
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState<BeneficiaryRelationship>('Filho');
  const [beneficiaryFullName, setBeneficiaryFullName] = useState('');
  const [beneficiaryDocument, setBeneficiaryDocument] = useState('');

  const loadBeneficiaries = useCallback(async () => {
    setBeneficiariesLoading(true);
    try {
      if (!isDemoMode && isSupabaseConfigured() && userId) {
        const { data, error } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          const mapped: Beneficiary[] = data.map((b: any) => ({
            id: b.id,
            relationship: b.relationship,
            fullName: b.full_name,
            document: b.document,
          }));
          setBeneficiaries(mapped);
          setBeneficiariesLoading(false);
          return;
        }
      }

      const stored = await getSecureItem<Beneficiary[]>(SECURE_KEYS.BENEFICIARIES(userIdForStorage));
      if (!stored || !Array.isArray(stored)) {
        setBeneficiaries([]);
        return;
      }
      setBeneficiaries(stored);
    } catch {
      setBeneficiaries([]);
    } finally {
      setBeneficiariesLoading(false);
    }
  }, [userIdForStorage, isDemoMode, userId]);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  const persistBeneficiaries = useCallback(
    async (next: Beneficiary[]) => {
      await setSecureItem(SECURE_KEYS.BENEFICIARIES(userIdForStorage), next);
      setBeneficiaries(next);
    },
    [userIdForStorage]
  );

  const openAddBeneficiary = useCallback(() => {
    setBeneficiaryEditingId(null);
    setBeneficiaryRelationship('Filho');
    setBeneficiaryFullName('');
    setBeneficiaryDocument('');
    setBeneficiaryModalVisible(true);
  }, []);

  const openEditBeneficiary = useCallback((b: Beneficiary) => {
    setBeneficiaryEditingId(b.id);
    setBeneficiaryRelationship(b.relationship);
    setBeneficiaryFullName(b.fullName);
    setBeneficiaryDocument(b.document);
    setBeneficiaryModalVisible(true);
  }, []);

  const handleSaveBeneficiary = useCallback(async () => {
    const fullName = beneficiaryFullName.trim();
    const document = beneficiaryDocument.trim();

    if (!fullName) {
      Alert.alert('Erro', 'Informe o nome do beneficiário.');
      return;
    }

    if (!document) {
      Alert.alert('Erro', 'Informe o documento do beneficiário.');
      return;
    }

    setBeneficiarySaving(true);
    try {
      const now = Date.now().toString();
      const next: Beneficiary[] =
        beneficiaryEditingId == null
          ? [
              ...beneficiaries,
              {
                id: now,
                relationship: beneficiaryRelationship,
                fullName,
                document,
              },
            ]
          : beneficiaries.map((b) =>
              b.id === beneficiaryEditingId
                ? { ...b, relationship: beneficiaryRelationship, fullName, document }
                : b
            );

      await persistBeneficiaries(next);
      setBeneficiaryModalVisible(false);
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Falha ao salvar beneficiário.');
    } finally {
      setBeneficiarySaving(false);
    }
  }, [
    beneficiaryDocument,
    beneficiaryEditingId,
    beneficiaryFullName,
    beneficiaryRelationship,
    beneficiaries,
    persistBeneficiaries,
  ]);

  const handleDeleteBeneficiary = useCallback(
    (b: Beneficiary) => {
      Alert.alert('Remover', `Remover "${b.fullName}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              const next = beneficiaries.filter((x) => x.id !== b.id);
              await persistBeneficiaries(next);
            } catch (e: any) {
              Alert.alert('Erro', e?.message || 'Falha ao remover beneficiário.');
            }
          },
        },
      ]);
    },
    [beneficiaries, persistBeneficiaries]
  );

  return {
    beneficiaries,
    beneficiariesLoading,
    beneficiaryModalVisible,
    beneficiarySaving,
    beneficiaryEditingId,
    beneficiaryRelationship,
    beneficiaryFullName,
    beneficiaryDocument,
    openAddBeneficiary,
    openEditBeneficiary,
    handleSaveBeneficiary,
    handleDeleteBeneficiary,
    setBeneficiaryRelationship,
    setBeneficiaryFullName,
    setBeneficiaryDocument,
    setBeneficiaryModalVisible,
    loadBeneficiaries,
  };
}
