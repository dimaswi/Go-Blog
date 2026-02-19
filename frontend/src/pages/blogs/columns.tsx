import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Pencil, Trash2, Globe, EyeOff } from 'lucide-react';
import type { Blog } from '@/lib/api';

interface BlogColumnOptions {
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onTogglePublish: (blog: Blog) => void;
  hasViewPermission: boolean;
  hasEditPermission: boolean;
  hasDeletePermission: boolean;
}

export function createBlogColumns(options: BlogColumnOptions): ColumnDef<Blog>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <p className="font-medium truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">{row.original.slug}</p>
        </div>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.category?.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'published' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }) => row.original.author?.full_name || '-',
    },
    {
      accessorKey: 'view_count',
      header: 'Views',
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {options.hasViewPermission && (
              <DropdownMenuItem onClick={() => options.onView(row.original.id)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
            )}
            {options.hasEditPermission && (
              <DropdownMenuItem onClick={() => options.onEdit(row.original.id)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}
            {options.hasEditPermission && (
              <DropdownMenuItem onClick={() => options.onTogglePublish(row.original)}>
                {row.original.status === 'published' ? (
                  <><EyeOff className="mr-2 h-4 w-4" /> Unpublish</>
                ) : (
                  <><Globe className="mr-2 h-4 w-4 text-green-500" /> <span className="text-green-600">Publish</span></>
                )}
              </DropdownMenuItem>
            )}
            {options.hasDeletePermission && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => options.onDelete(row.original.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
