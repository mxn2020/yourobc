// src/features/projects/components/ProjectsHelpSection.tsx

import { FC } from 'react'
import { Card, Alert, AlertDescription } from '@/components/ui'
import { useTranslation } from '@/features/system/i18n'

export const ProjectsHelpSection: FC = () => {
  const { t } = useTranslation('projects')
  return (
    <div className="mt-12 space-y-6">
      <Alert variant="default">
        <AlertDescription>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📋 {t('helpSection.managementTips.title')}</h3>
              <ul className="text-sm text-blue-800 space-y-2 ml-4 list-disc">
                <li>{t('helpSection.managementTips.tip1')}</li>
                <li>{t('helpSection.managementTips.tip2')}</li>
                <li>{t('helpSection.managementTips.tip3')}</li>
                <li>{t('helpSection.managementTips.tip4')}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">🎯 {t('helpSection.priorityLevels.title')}</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>{t('priority.urgent')}:</strong> {t('helpSection.priorityLevels.urgent')}</div>
                <div><strong>{t('priority.high')}:</strong> {t('helpSection.priorityLevels.high')}</div>
                <div><strong>{t('priority.medium')}:</strong> {t('helpSection.priorityLevels.medium')}</div>
                <div><strong>{t('priority.low')}:</strong> {t('helpSection.priorityLevels.low')}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-blue-900 mb-2">📊 {t('helpSection.statusDescriptions.title')}</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>{t('status.active')}:</strong> {t('helpSection.statusDescriptions.active')}</div>
                <div><strong>{t('status.completed')}:</strong> {t('helpSection.statusDescriptions.completed')}</div>
                <div><strong>{t('status.onHold')}:</strong> {t('helpSection.statusDescriptions.onHold')}</div>
                <div><strong>{t('status.archived')}:</strong> {t('helpSection.statusDescriptions.archived')}</div>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  )
}
