// src/features/ai-testing/components/TestHistory/TestCard.tsx
import React, { useState, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, Play, Eye, Trash2, MoreHorizontal } from 'lucide-react';
import { Badge, Button, Card, CardContent, Checkbox } from '@/components/ui';
import type { TestHistoryItem } from '../../types/test-results.types';
import type { TestViewMode } from '../../types/test.types';
import { formatTestHistoryItem } from '../../utils/test-formatters';
import { useTestHistory } from '../../hooks/useTestHistory';

interface TestCardProps {
  test: TestHistoryItem;
  viewMode: TestViewMode;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function TestCard({ test, viewMode, isSelected, onSelect, onDelete }: TestCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [details, setDetails] = useState<any>(null);
  
  const { getTestDetails } = useTestHistory();
  const formatted = formatTestHistoryItem(test);

  const handleViewDetails = useCallback(async () => {
    if (details) {
      setShowDetails(!showDetails);
      return;
    }

    setIsLoadingDetails(true);
    try {
      const testDetails = await getTestDetails(test.id);
      setDetails(testDetails);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to load test details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [test.id, details, showDetails, getTestDetails]);

  const StatusIcon = test.status === 'completed' ? CheckCircle : 
                    test.status === 'failed' ? XCircle : 
                    test.status === 'running' ? Play : Clock;

  if (viewMode === 'list') {
    return (
      <div className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Checkbox
              checked={isSelected}
              onChange={onSelect}
            />
            
            <StatusIcon className={`h-4 w-4 flex-shrink-0 ${
              test.status === 'completed' ? 'text-green-600' : 
              test.status === 'failed' ? 'text-red-600' : 
              test.status === 'running' ? 'text-blue-600' : 'text-yellow-600'
            }`} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900 truncate">{test.name}</h3>
                <Badge size="sm" className={formatted.statusDisplay.color}>
                  {formatted.statusDisplay.label}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="truncate">{test.modelId}</span>
                <span>{test.type}</span>
                <span>{formatted.dateText}</span>
                {formatted.durationText !== '-' && <span>{formatted.durationText}</span>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-sm">
              <div className="font-medium text-gray-900">{formatted.summaryText}</div>
              <div className="text-gray-600">{formatted.durationText}</div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleViewDetails}
                disabled={isLoadingDetails}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {showDetails && details && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">Total Cost</div>
                  <div className="font-medium">${test.summary.totalCost.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Avg Latency</div>
                  <div className="font-medium">{Math.round(test.summary.avgLatency)}ms</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Total Cost</div>
                  <div className="font-medium">${test.summary.totalCost?.toFixed(4) || '0.00'}</div>
                </div>
                <div>
                  <div className="text-gray-600 mb-1">Success Rate</div>
                  <div className="font-medium">{test.summary.successRate.toFixed(1)}%</div>
                </div>
              </div>
              
              {details.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Test Results</div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {details.slice(0, 5).map((detail: any, index: number) => (
                      <div key={index} className="bg-white rounded p-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Result {index + 1}</span>
                          <Badge size="sm" className={
                            detail.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }>
                            {detail.status}
                          </Badge>
                        </div>
                        {detail.response && (
                          <div className="mt-1 text-gray-600 truncate">
                            {typeof detail.response === 'string' 
                              ? detail.response.substring(0, 100) + '...'
                              : JSON.stringify(detail.response).substring(0, 100) + '...'
                            }
                          </div>
                        )}
                      </div>
                    ))}
                    {details.length > 5 && (
                      <div className="text-sm text-gray-500 text-center">
                        ...and {details.length - 5} more results
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Grid view
  return (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${
      isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()}
            />
            <StatusIcon className={`h-4 w-4 ${
              test.status === 'completed' ? 'text-green-600' : 
              test.status === 'failed' ? 'text-red-600' : 
              test.status === 'running' ? 'text-blue-600' : 'text-yellow-600'
            }`} />
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleViewDetails}
              disabled={isLoadingDetails}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-gray-900 truncate" title={test.name}>
              {test.name}
            </h3>
            <p className="text-sm text-gray-600 truncate" title={test.modelId}>
              {test.modelId}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Badge size="sm" className={formatted.statusDisplay.color}>
              {formatted.statusDisplay.label}
            </Badge>
            <Badge size="sm" variant="secondary">
              {test.type}
            </Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tests:</span>
              <span className="font-medium">{formatted.summaryText}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{formatted.durationText}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatted.dateText}</span>
            </div>

            {test.summary.totalCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cost:</span>
                <span className="font-medium text-green-600">
                  ${test.summary.totalCost.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </div>

        {showDetails && details && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Avg Latency:</span>
                <span className="ml-1 font-medium">{Math.round(test.summary.avgLatency)}ms</span>
              </div>
              <div>
                <span className="text-gray-600">Success Rate:</span>
                <span className="ml-1 font-medium">{test.summary.successRate.toFixed(1)}%</span>
              </div>
            </div>
            
            {details.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-gray-600 mb-1">Latest Results:</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {details.slice(0, 3).map((detail: any, index: number) => (
                    <div key={index} className="text-xs bg-gray-50 rounded p-1">
                      <div className="flex justify-between">
                        <span>Result {index + 1}</span>
                        <Badge size="sm" className={`text-xs ${
                          detail.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {detail.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}