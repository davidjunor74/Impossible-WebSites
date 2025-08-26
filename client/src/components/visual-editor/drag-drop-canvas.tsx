import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  Settings,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from "lucide-react";
import type { BlockData } from "./block-library";
import BlockRenderer from "./block-renderer";

export interface PageBlock {
  id: string;
  type: string;
  props: Record<string, any>;
  isSelected?: boolean;
  isVisible?: boolean;
  isLocked?: boolean;
}

interface DragDropCanvasProps {
  blocks: PageBlock[];
  onBlocksChange: (blocks: PageBlock[]) => void;
  selectedBlockId?: string;
  onBlockSelect: (blockId: string | null) => void;
  isPreviewMode?: boolean;
}

export default function DragDropCanvas({ 
  blocks, 
  onBlocksChange, 
  selectedBlockId, 
  onBlockSelect,
  isPreviewMode = false 
}: DragDropCanvasProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Find the nearest insertion point
    let insertIndex = blocks.length;
    
    const blockElements = canvasRef.current.querySelectorAll('[data-block-index]');
    for (let i = 0; i < blockElements.length; i++) {
      const element = blockElements[i] as HTMLElement;
      const blockRect = element.getBoundingClientRect();
      const blockY = blockRect.top - rect.top + blockRect.height / 2;
      
      if (y < blockY) {
        insertIndex = i;
        break;
      }
    }
    
    setDragOverIndex(insertIndex);
  }, [blocks.length]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over if leaving the canvas entirely
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverIndex(null);
    setIsDragging(false);
    
    try {
      const blockData = JSON.parse(e.dataTransfer.getData('application/json')) as BlockData;
      const insertIndex = dragOverIndex ?? blocks.length;
      
      const newBlock: PageBlock = {
        id: `${blockData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: blockData.type,
        props: { ...blockData.defaultProps },
        isVisible: true,
        isLocked: false
      };
      
      const newBlocks = [...blocks];
      newBlocks.splice(insertIndex, 0, newBlock);
      
      onBlocksChange(newBlocks);
      onBlockSelect(newBlock.id);
    } catch (error) {
      console.error('Error dropping block:', error);
    }
  }, [blocks, dragOverIndex, onBlocksChange, onBlockSelect]);

  const handleBlockClick = useCallback((blockId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPreviewMode) {
      onBlockSelect(selectedBlockId === blockId ? null : blockId);
    }
  }, [isPreviewMode, onBlockSelect, selectedBlockId]);

  const handleCanvasClick = useCallback(() => {
    if (!isPreviewMode) {
      onBlockSelect(null);
    }
  }, [isPreviewMode, onBlockSelect]);

  const duplicateBlock = useCallback((blockId: string) => {
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    if (blockIndex === -1) return;
    
    const originalBlock = blocks[blockIndex];
    const newBlock: PageBlock = {
      ...originalBlock,
      id: `${originalBlock.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, newBlock);
    
    onBlocksChange(newBlocks);
    onBlockSelect(newBlock.id);
  }, [blocks, onBlocksChange, onBlockSelect]);

  const deleteBlock = useCallback((blockId: string) => {
    const newBlocks = blocks.filter(b => b.id !== blockId);
    onBlocksChange(newBlocks);
    if (selectedBlockId === blockId) {
      onBlockSelect(null);
    }
  }, [blocks, onBlocksChange, onBlockSelect, selectedBlockId]);

  const moveBlock = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const toggleBlockVisibility = useCallback((blockId: string) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, isVisible: !block.isVisible }
        : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const toggleBlockLock = useCallback((blockId: string) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, isLocked: !block.isLocked }
        : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  const updateBlockProps = useCallback((blockId: string, newProps: Record<string, any>) => {
    const newBlocks = blocks.map(block => 
      block.id === blockId 
        ? { ...block, props: { ...block.props, ...newProps } }
        : block
    );
    onBlocksChange(newBlocks);
  }, [blocks, onBlocksChange]);

  return (
    <div 
      ref={canvasRef}
      className={`min-h-screen w-full bg-white relative ${!isPreviewMode ? 'p-4' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Drop indicator */}
      {dragOverIndex !== null && !isPreviewMode && (
        <div 
          className="absolute left-0 right-0 h-0.5 bg-blue-500 z-50 pointer-events-none"
          style={{
            top: dragOverIndex === 0 ? 16 : 
                 dragOverIndex >= blocks.length ? '100%' :
                 `${((dragOverIndex) * 100) / blocks.length}%`
          }}
        >
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full" />
        </div>
      )}

      {/* Empty state */}
      {blocks.length === 0 && !isPreviewMode && (
        <div className="flex flex-col items-center justify-center min-h-96 text-center border-2 border-dashed border-gray-300 rounded-lg">
          <Plus className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">Start Building Your Page</h3>
          <p className="text-gray-500 max-w-md">
            Drag blocks from the library on the left to start building your website. 
            You can add text, images, forms, and more.
          </p>
        </div>
      )}

      {/* Blocks */}
      {blocks.map((block, index) => (
        <div
          key={block.id}
          data-block-index={index}
          className={`relative group ${!isPreviewMode ? 'mb-4' : ''} ${
            !block.isVisible ? 'opacity-50' : ''
          }`}
          style={{ display: !isPreviewMode || block.isVisible ? 'block' : 'none' }}
        >
          {/* Block wrapper with selection and controls */}
          {!isPreviewMode && (
            <div
              className={`absolute inset-0 border-2 transition-all cursor-pointer ${
                selectedBlockId === block.id
                  ? 'border-blue-500 bg-blue-50/20'
                  : 'border-transparent hover:border-gray-300'
              } ${block.isLocked ? 'cursor-not-allowed' : ''}`}
              onClick={(e) => handleBlockClick(block.id, e)}
            >
              {/* Block controls */}
              <div className={`absolute -top-10 left-0 flex items-center gap-1 transition-opacity ${
                selectedBlockId === block.id || true ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div className="bg-white border rounded-md shadow-sm flex">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBlockVisibility(block.id);
                    }}
                  >
                    {block.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBlockLock(block.id);
                    }}
                  >
                    {block.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateBlock(block.id);
                    }}
                    disabled={block.isLocked}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteBlock(block.id);
                    }}
                    disabled={block.isLocked}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                {/* Block type label */}
                <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  {block.type}
                </div>
              </div>

              {/* Move handle */}
              <div className="absolute -left-8 top-1/2 transform -translate-y-1/2">
                <div className="bg-white border rounded shadow-sm p-1 cursor-move">
                  <Move className="w-3 h-3 text-gray-500" />
                </div>
              </div>
            </div>
          )}

          {/* Actual block content */}
          <div className={selectedBlockId === block.id && !isPreviewMode ? 'relative z-10' : ''}>
            <BlockRenderer
              block={block}
              isSelected={selectedBlockId === block.id}
              isPreviewMode={isPreviewMode}
              onPropsChange={(newProps) => updateBlockProps(block.id, newProps)}
            />
          </div>
        </div>
      ))}

      {/* Add block button at the end */}
      {!isPreviewMode && blocks.length > 0 && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            className="border-dashed border-2 w-full max-w-md h-16 text-gray-500 hover:text-gray-700 hover:border-gray-400"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverIndex(blocks.length);
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Drop a block here or drag from the library
          </Button>
        </div>
      )}
    </div>
  );
}