// src/components/ui/Resizable.example.tsx
// Example usage of the Resizable component

import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './Resizable'

// ============================================================================
// BASIC HORIZONTAL LAYOUT
// ============================================================================

export function BasicHorizontalExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Sidebar</h2>
            <p className="text-sm text-gray-600">This panel can be resized</p>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75} minSize={60}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">Main Content</h2>
            <p className="text-sm text-gray-600">This is the main content area</p>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// VERTICAL LAYOUT
// ============================================================================

export function VerticalExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={30} minSize={20}>
          <div className="p-4 bg-blue-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Header</h2>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">Content</h2>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// THREE PANEL LAYOUT
// ============================================================================

export function ThreePanelExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Left Sidebar</h2>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">Main Content</h2>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Right Sidebar</h2>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// NESTED RESIZABLE PANELS
// ============================================================================

export function NestedExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        {/* Left sidebar */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Sidebar</h2>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main content with vertical split */}
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={60} minSize={30}>
              <div className="p-4 h-full">
                <h2 className="text-lg font-semibold mb-2">Main Content</h2>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40} minSize={20}>
              <div className="p-4 bg-gray-50 h-full">
                <h2 className="text-lg font-semibold mb-2">Bottom Panel</h2>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// WITH AUTO-SAVE (Persists to localStorage)
// ============================================================================

export function AutoSaveExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="editor-layout"
        onLayout={(sizes) => console.log('Layout changed:', sizes)}
      >
        <ResizablePanel id="sidebar" defaultSize={25} minSize={15}>
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Sidebar</h2>
            <p className="text-xs text-gray-500">Layout is auto-saved!</p>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel id="main" defaultSize={75}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">Main Content</h2>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// COLLAPSIBLE PANEL
// ============================================================================

export function CollapsibleExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={25}
          minSize={15}
          collapsible
          collapsedSize={0}
          onCollapse={() => console.log('Panel collapsed')}
          onExpand={() => console.log('Panel expanded')}
        >
          <div className="p-4 bg-gray-50 h-full">
            <h2 className="text-lg font-semibold mb-2">Collapsible Sidebar</h2>
            <p className="text-xs text-gray-500">Drag to edge to collapse</p>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={75}>
          <div className="p-4 h-full">
            <h2 className="text-lg font-semibold mb-2">Main Content</h2>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

// ============================================================================
// EDITOR-LIKE LAYOUT (Like PromptEditorPage)
// ============================================================================

export function EditorLayoutExample() {
  return (
    <div className="h-screen">
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="prompt-editor"
      >
        {/* Left sidebar - Components tree */}
        <ResizablePanel
          id="components-panel"
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible
        >
          <div className="p-4 bg-gray-50 h-full overflow-auto">
            <h3 className="font-semibold mb-2">Components</h3>
            {/* ComponentsTree would go here */}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Main editor area */}
        <ResizablePanel
          id="editor-panel"
          defaultSize={55}
          minSize={40}
        >
          <ResizablePanelGroup direction="vertical">
            {/* Editor */}
            <ResizablePanel
              id="code-editor"
              defaultSize={60}
              minSize={30}
            >
              <div className="p-4 h-full">
                <h3 className="font-semibold mb-2">Editor</h3>
                {/* MonacoEditor would go here */}
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Preview */}
            <ResizablePanel
              id="preview"
              defaultSize={40}
              minSize={20}
            >
              <div className="p-4 bg-gray-50 h-full">
                <h3 className="font-semibold mb-2">Preview</h3>
                {/* MarkdownPreview would go here */}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right sidebar - Variables/Testing */}
        <ResizablePanel
          id="tools-panel"
          defaultSize={25}
          minSize={15}
          maxSize={35}
          collapsible
        >
          <div className="p-4 bg-gray-50 h-full overflow-auto">
            <h3 className="font-semibold mb-2">Tools</h3>
            {/* VariablesPanel, TestingPanel would go here */}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
