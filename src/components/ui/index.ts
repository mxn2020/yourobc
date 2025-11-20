// src/components/ui/index.ts

// Export shared types
export type * from './types'

// Basic form components
export { Button } from './Button'
export { Input } from './Input'
export { Textarea } from './Textarea'
export { Checkbox } from './Checkbox'
export { Switch } from './Switch'
export { RadioGroup, RadioGroupItem } from './RadioGroup'

// Display components
export { Badge, StatusBadge, PriorityBadge } from './Badge'
export { Chip } from './Chip'
export { Loading, LoadingSkeleton } from './Loading'
export { Tooltip } from './Tooltip'
export { CostDisplay, SimpleCostDisplay } from './CostDisplay'

// Layout components
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card'
export { Section, SectionHeader, SectionTitle, SectionDescription, SectionContent, CompoundSection } from './Section'
export { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption, DataTable } from './Table'
export { ListItem, ListContainer, DataList, CompactListView } from './List'
export { ViewSwitcher, type ViewMode } from './ViewSwitcher'
export { Separator } from './Separator'
export { Breadcrumb, useProjectBreadcrumbs, type BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb'

// Interactive components
export { Modal, ModalHeader, ModalBody, ModalFooter } from './Modal'
export { Tabs, TabsList, TabsTrigger, TabsContent, SimpleTabs } from './Tabs'
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SimpleSelect } from './Select'
export { Progress } from './Progress'
export { Slider } from './Slider'

// Compound components with context
export { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from './Dialog'

export { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuLabel, 
  DropdownMenuCheckboxItem 
} from './DropdownMenu'

export { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible'

export { Alert, AlertTitle, AlertDescription, AlertIcon, CompoundAlert } from './Alert'

export { 
  AlertDialog, 
  AlertDialogTrigger, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogAction, 
  AlertDialogCancel 
} from './AlertDialog'

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverArrow,
  PopoverClose
} from './Popover'

// Utility components
export { Avatar, AvatarImage, AvatarFallback, CompoundAvatar, getAvatarInitials } from './Avatar'
export { Label } from './Label'
export { Skeleton } from './Skeleton'
export { Calendar } from './Calendar'
export { DatePicker } from './DatePicker'
export { DateTimePicker } from './DateTimePicker'

// Error handling components
export { ErrorModal } from './ErrorModal'
export { PermissionDenied, type PermissionDeniedProps } from '../Permission/PermissionDenied'
export { ErrorState, type ErrorStateProps, type ParsedError, type ErrorType } from './ErrorState'
export { EmptyState, type EmptyStateProps, type EmptyStateVariant, NoSearchResults, NoFilterResults } from './EmptyState'

// Modal components
export {
  DeleteConfirmationModal,
  useDeleteConfirmation,
  type DeleteConfirmationModalProps,
  type UseDeleteConfirmationOptions
} from './Modals'

export { ScrollArea } from './ScrollArea'


/* Ideas for additional components

export { Pagination } from './Pagination'
export { RichTextEditor } from './RichTextEditor'
export { FileUploader } from './FileUploader'
export { ImageUploader } from './ImageUploader'
export { MarkdownViewer } from './MarkdownViewer'
export { CodeBlock } from './CodeBlock'
export { JsonViewer } from './JsonViewer'
export { TreeView, TreeNode } from './TreeView'
export { Wizard, WizardStep } from './Wizard'
export { ToastProvider, useToast } from './Toast'
export { Banner } from './Banner'
export { HamburgerMenu } from './HamburgerMenu'
export { CopyButton } from './CopyButton'
export { BackButton } from './BackButton'
export { LinkButton } from './LinkButton'
export { ScrollToTopButton } from './ScrollToTopButton'
export { FloatingButton } from './FloatingButton'
export { ExpandableText } from './ExpandableText'
export { StarRating } from './StarRating'
export { ColorPicker } from './ColorPicker'
export { TimePicker } from './TimePicker'
export { ToggleButton } from './ToggleButton'
export { VideoPlayer } from './VideoPlayer'
export { AudioPlayer } from './AudioPlayer'
export { MapView } from './MapView'
export { QRCode } from './QRCode'
export { Barcode } from './Barcode'

*/
