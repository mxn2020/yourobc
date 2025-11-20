// src/features/boilerplate/[module_name]/components/[Entity]FormModal.tsx

import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui";
import { [Entity]Form } from "./[Entity]Form";
import { useTranslation } from "@/features/boilerplate/i18n";
import type { Create[Entity]Data, Update[Entity]Data, [Entity] } from "../types";

interface [Entity]FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Partial<[Entity]>;
  onSubmit: (data: Create[Entity]Data | Update[Entity]Data) => void | Promise<void>;
  isLoading?: boolean;
}

export const [Entity]FormModal: FC<[Entity]FormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const { t } = useTranslation("[module_name]");

  const title = mode === 'create'
    ? t('modal.create.title')
    : t('modal.edit.title');

  const description = mode === 'create'
    ? t('modal.create.description')
    : t('modal.edit.description');

  const handleSubmit = async (data: Create[Entity]Data | Update[Entity]Data) => {
    await onSubmit(data);
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <[Entity]Form
          mode={mode}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};
