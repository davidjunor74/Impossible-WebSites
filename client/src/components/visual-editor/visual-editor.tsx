import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  EyeOff, 
  Undo, 
  Redo, 
  Save, 
  Settings,
  Layers,
  Palette,
  Smartphone,
  Tablet,
  Monitor
} from "lucide-react";
import BlockLibrary, { type BlockData } from "./block-library";
import DragDropCanvas, { type PageBlock } from "./drag-drop-canvas";
import PropertyEditor from "./property-editor";

interface VisualEditorProps {
  initialBlocks?: PageBlock[];
  onSave?: (blocks: PageBlock[]) => void;
  onPreview?: () => void;
}

export default function VisualEditor({ 
  initialBlocks = [], 
  onSave, 
  onPreview 
}: VisualEditorProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [viewportSize, setViewportSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [history, setHistory] = useState<PageBlock[][]>([initialBlocks]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [draggedBlock, setDraggedBlock] = useState<BlockData | null>(null);
  const [leftPanelTab, setLeftPanelTab] = useState<'blocks' | 'layers'>('blocks');
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'design'>('properties');

  const selectedBlock = blocks.find(block => block.id === selectedBlockId) || null;

  // History management
  const addToHistory = useCallback((newBlocks: PageBlock[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newBlocks]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setBlocks(newBlocks);
  }, [history, historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBlocks([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBlocks([...history[newIndex]]);
    }
  }, [history, historyIndex]);

  const handleBlocksChange = useCallback((newBlocks: PageBlock[]) => {
    addToHistory(newBlocks);
  }, [addToHistory]);

  const handleBlockSelect = useCallback((blockId: string | null) => {
    setSelectedBlockId(blockId);
  }, []);

  const handleBlockPropsChange = useCallback((blockId: string, newProps: Record<string, any>) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, props: { ...block.props, ...newProps } }
        : block
    );
    addToHistory(newBlocks);
  }, [blocks, addToHistory]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(blocks);
    }
  }, [blocks, onSave]);

  const handlePreview = useCallback(() => {
    setIsPreviewMode(!isPreviewMode);
    if (onPreview) {
      onPreview();
    }
  }, [isPreviewMode, onPreview]);

  const handleDragStart = useCallback((block: BlockData) => {
    setDraggedBlock(block);
  }, []);

  const getViewportClasses = () => {
    switch (viewportSize) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm"
              onClick={undo}
              disabled={historyIndex === 0}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={redo}
              disabled={historyIndex === history.length - 1}
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>

          {/* Viewport Size Controls */}
          <div className="flex items-center gap-1 border rounded-md">
            <Button
              variant={viewportSize === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('mobile')}
              className="rounded-r-none"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportSize === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('tablet')}
              className="rounded-none border-l-0 border-r-0"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              variant={viewportSize === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewportSize('desktop')}
              className="rounded-l-none"
            >
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Preview Toggle */}
          <Button 
            variant={isPreviewMode ? 'default' : 'outline'}
            size="sm"
            onClick={handlePreview}
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>

          {/* Save Button */}
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-r flex flex-col">
            {/* Panel Tabs */}
            <div className="border-b">
              <div className="flex">
                <Button
                  variant={leftPanelTab === 'blocks' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLeftPanelTab('blocks')}
                  className="flex-1 rounded-none"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Blocks
                </Button>
                <Button
                  variant={leftPanelTab === 'layers' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setLeftPanelTab('layers')}
                  className="flex-1 rounded-none"
                >
                  <Layers className="w-4 h-4 mr-2" />
                  Layers
                </Button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {leftPanelTab === 'blocks' ? (
                <BlockLibrary onDragStart={handleDragStart} />
              ) : (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Page Layers</h3>
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className={`p-2 border rounded cursor-pointer transition-colors ${
                          selectedBlockId === block.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleBlockSelect(block.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium capitalize">{block.type}</span>
                          <div className="flex items-center gap-1">
                            {!block.isVisible && <EyeOff className="w-3 h-3 text-gray-400" />}
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {blocks.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No blocks yet. Drag blocks from the library to get started.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100">
          <div className={`transition-all duration-300 ${getViewportClasses()} ${isPreviewMode ? 'pt-0' : 'pt-8'}`}>
            <div className="bg-white shadow-lg">
              <DragDropCanvas
                blocks={blocks}
                onBlocksChange={handleBlocksChange}
                selectedBlockId={selectedBlockId}
                onBlockSelect={handleBlockSelect}
                isPreviewMode={isPreviewMode}
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        {!isPreviewMode && (
          <div className="w-80 bg-white border-l flex flex-col">
            {/* Panel Tabs */}
            <div className="border-b">
              <div className="flex">
                <Button
                  variant={rightPanelTab === 'properties' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRightPanelTab('properties')}
                  className="flex-1 rounded-none"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Properties
                </Button>
                <Button
                  variant={rightPanelTab === 'design' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setRightPanelTab('design')}
                  className="flex-1 rounded-none"
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Design
                </Button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'properties' ? (
                <PropertyEditor
                  selectedBlock={selectedBlock}
                  onPropsChange={handleBlockPropsChange}
                />
              ) : (
                <div className="p-4">
                  <h3 className="font-medium mb-4">Global Design</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-16 h-10 p-1 border rounded"
                          defaultValue="#2563eb"
                        />
                        <input
                          type="text"
                          className="flex-1 px-3 py-2 border rounded"
                          defaultValue="#2563eb"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Font Family
                      </label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="opensans">Open Sans</option>
                        <option value="poppins">Poppins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Border Radius
                      </label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {!isPreviewMode && (
        <div className="h-8 bg-gray-100 border-t flex items-center justify-between px-4 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <span>{blocks.length} blocks</span>
            {selectedBlock && <span>Selected: {selectedBlock.type}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>Viewport: {viewportSize}</span>
            <span>Zoom: 100%</span>
          </div>
        </div>
      )}
    </div>
  );
}