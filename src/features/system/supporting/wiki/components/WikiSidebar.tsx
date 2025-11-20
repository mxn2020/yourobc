// src/features/system/supporting/wiki/components/WikiSidebar.tsx

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WikiService } from '../services';
import type { WikiEntry } from '../types';

interface WikiSidebarProps {
  entries: WikiEntry[];
  selectedCategory?: string;
  selectedTag?: string;
  onCategorySelect?: (category: string) => void;
  onTagSelect?: (tag: string) => void;
}

export function WikiSidebar({
  entries,
  selectedCategory,
  selectedTag,
  onCategorySelect,
  onTagSelect,
}: WikiSidebarProps) {
  const categories = WikiService.getCategoryTree(entries);
  const allTags = WikiService.getAllTags(entries);

  return (
    <div className="space-y-4">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(categories).map(([category, count]) => (
              <button
                key={category}
                onClick={() => onCategorySelect?.(category)}
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 flex items-center justify-between ${
                  selectedCategory === category ? 'bg-gray-100 font-medium' : ''
                }`}
              >
                <span className="text-sm">{category}</span>
                <Badge variant="secondary" className="text-xs">{count}</Badge>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      {allTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? 'primary' : 'outline'}
                  className="text-xs cursor-pointer"
                  onClick={() => onTagSelect?.(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
