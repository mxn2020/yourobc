// src/features/ai-models/components/ModelSettings/DefaultModelSettings.tsx
import { useState } from 'react';
import { useToast } from '@/features/system/notifications';
import { Button, Card, CardContent, CardHeader, Modal, SimpleSelect as Select } from '@/components/ui';
import { useAuth } from '@/features/system/auth';
import { useModelPreferences, useUpdateModelPreferences } from '../../hooks/useModelPreferences';
import type { ModelInfo } from '@/features/system/ai-core/types';
import { Id } from "@/convex/_generated/dataModel";

interface DefaultModelSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelInfo[];
}

export function DefaultModelSettings({ isOpen, onClose, models }: DefaultModelSettingsProps) {
  const toast = useToast();
  const { auth, isAuthenticated } = useAuth();
  const { data: preferences } = useModelPreferences();
  const updatePreferences = useUpdateModelPreferences();
  const [isLoading, setIsLoading] = useState(false);
  
  const [languageModel, setLanguageModel] = useState(preferences?.defaultModels.language || '');
  const [embeddingModel, setEmbeddingModel] = useState(preferences?.defaultModels.embedding || '');
  const [imageModel, setImageModel] = useState(preferences?.defaultModels.image || '');
  
  const languageModels = models.filter(m => m.type === 'language');
  const embeddingModels = models.filter(m => m.type === 'embedding');
  const imageModels = models.filter(m => m.type === 'image');
  
  const handleSave = async () => {
    if (!isAuthenticated || !auth?.id) {
      toast.error('Please sign in to save preferences');
      return;
    }

    setIsLoading(true);
    try {
      await updatePreferences({
        defaultLanguageModel: languageModel || undefined,
        defaultEmbeddingModel: embeddingModel || undefined,
        defaultImageModel: imageModel || undefined,
      });
      toast.success('Default models updated successfully');
      onClose();
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Default Model Settings</h2>
        
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Set Default Models</h3>
            <p className="text-sm text-gray-600">
              Choose your preferred models for each task type
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Language Model"
              options={[
                { value: '', label: 'No default' },
                ...languageModels.map(m => ({ value: m.id, label: `${m.name} (${m.provider})` }))
              ]}
              value={languageModel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguageModel(e.target.value)}
            />

            <Select
              label="Embedding Model"
              options={[
                { value: '', label: 'No default' },
                ...embeddingModels.map(m => ({ value: m.id, label: `${m.name} (${m.provider})` }))
              ]}
              value={embeddingModel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEmbeddingModel(e.target.value)}
            />

            <Select
              label="Image Model"
              options={[
                { value: '', label: 'No default' },
                ...imageModels.map(m => ({ value: m.id, label: `${m.name} (${m.provider})` }))
              ]}
              value={imageModel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setImageModel(e.target.value)}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                onClick={handleSave} 
                loading={isLoading}
                disabled={!isAuthenticated || !auth?.id}
              >
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}

