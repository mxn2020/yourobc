// src/features/system/supporting/wiki/components/WikiEntryCard.tsx

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Eye, Edit, Archive, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { WikiService } from '../services';
import type { WikiEntry } from '../types';
import type { Id } from '@/convex/_generated/dataModel';

interface WikiEntryCardProps {
  entry: WikiEntry;
  currentUserId?: Id<"userProfiles">;
  onView?: (entryId: Id<'wikiEntries'>) => void;
  onEdit?: (entryId: Id<'wikiEntries'>) => void;
  onArchive?: (entryId: Id<'wikiEntries'>) => void;
  onDelete?: (entryId: Id<'wikiEntries'>) => void;
  compact?: boolean;
}

export function WikiEntryCard({
  entry,
  currentUserId,
  onView,
  onEdit,
  onArchive,
  onDelete,
  compact = false,
}: WikiEntryCardProps) {
  const isOwner = currentUserId === entry.createdBy;
  const visibilityIcon = WikiService.getVisibilityIcon(entry.visibility);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-2xl">{visibilityIcon}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium text-lg">{entry.title}</h3>
              {entry.summary && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{entry.summary}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">{entry.category}</Badge>
            <Badge variant={WikiService.getStatusBadgeVariant(entry.status)} className="text-xs">
              {entry.status}
            </Badge>
            {entry.tags && entry.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
            {entry.tags && entry.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{entry.tags.length - 3} more</span>
            )}
          </div>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span>By {entry.createdBy}</span>
            <span>•</span>
            <span>Updated {formatDistanceToNow(entry.updatedAt || entry.createdAt, { addSuffix: true })}</span>
          </div>

          <div className="flex items-center gap-2 mt-3">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(entry._id)}>
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
            )}
            {isOwner && onEdit && (
              <Button variant="ghost" size="sm" onClick={() => onEdit(entry._id)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
            )}
            {isOwner && entry.status !== 'archived' && onArchive && (
              <Button variant="ghost" size="sm" onClick={() => onArchive(entry._id)}>
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            )}
            {isOwner && onDelete && (
              <Button variant="ghost" size="sm" onClick={() => onDelete(entry._id)} className="text-red-600">
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
