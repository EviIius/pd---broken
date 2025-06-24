# Resizable Layout Feature Guide

This guide explains the new horizontal resizable layout feature in the Policy Q&A application.

## ✅ **Horizontal Resizable Layout**

### **What Changed:**
- **Layout Direction**: Changed from side-by-side (vertical) to top/bottom (horizontal) layout
- **Better UX**: More natural reading experience with full-width content
- **Improved Spacing**: Better utilization of screen real estate

### **Layout Structure:**

```
┌─────────────────────────────────────────┐
│              Filters Panel              │
├─────────────────────────────────────────┤
│          🗨️ Chat Assistant            │ ← Top Pane (Resizable)
│                                         │
├═════════════════════════════════════════┤ ← Horizontal Drag Handle
│          📋 Document List              │ ← Bottom Pane (Resizable)
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## **How to Use:**

### **🖱️ Resizing the Layout**
1. **Hover** over the horizontal divider between chat and document sections
2. **Look for** the grip handle (≡) that appears on hover
3. **Click and drag** up/down to adjust the size ratio
4. **Release** to set the new layout

### **📐 Layout Constraints**
- **Minimum Top Height**: 25% of available space
- **Maximum Top Height**: 75% of available space
- **Default Split**: 40% chat / 60% documents
- **Persistence**: Your preferred size is saved automatically

### **🎨 Visual Feedback**
- **Hover State**: Handle becomes visible with blue highlight
- **Dragging State**: Enhanced visual feedback with shadows
- **Cursor**: Changes to resize cursor (↕) when hovering
- **Smooth Transitions**: Animated color changes and effects

## **Technical Features:**

### **💾 Size Persistence**
- **Local Storage**: Your preferred layout size is automatically saved
- **Cross-Session**: Layout size persists between browser sessions
- **Per-User**: Each user's preferences are stored locally

### **📱 Responsive Design**
- **Mobile Friendly**: Layout adapts to different screen sizes
- **Touch Support**: Works with touch devices for mobile users
- **Accessible**: Keyboard navigation and screen reader compatible

### **🔧 Implementation Details**
- **Component**: `HorizontalResizableLayout.tsx`
- **Storage Key**: `resizable-layout-height`
- **Default Height**: 40% for chat, 60% for documents
- **Update Frequency**: Real-time during drag operations

## **Benefits:**

### **✅ Improved User Experience**
- **Natural Reading**: Full-width text is easier to read
- **Better Focus**: Larger content areas reduce scrolling
- **Flexible Workflow**: Adjust layout based on current task

### **✅ Space Efficiency**
- **Full Width**: Documents and chat use entire available width
- **No Cramping**: Text doesn't get squeezed into narrow columns
- **Optimal Ratios**: Users can set their preferred chat/document ratio

### **✅ Professional Layout**
- **Clean Design**: Horizontal divider looks more polished
- **Intuitive**: Users expect top/bottom layout in many applications
- **Consistent**: Matches common application layout patterns

## **API Quota Handling:**

### **🚫 Quota Exceeded Scenario**
When Gemini API quota is exceeded, the application gracefully handles the situation:

- **Health Status**: Shows "API quota exceeded - Using mock mode"
- **Mock Responses**: Provides demonstration responses for testing
- **User Notification**: Clear explanation of current status
- **Graceful Degradation**: All UI features remain functional

### **🔄 Recovery**
- **Automatic**: API will resume when quota resets (typically daily)
- **Manual Refresh**: Use the refresh button in the status tooltip
- **No Data Loss**: All user preferences and layout settings preserved

## **Usage Tips:**

1. **Start Wide**: Set chat to ~30% if you're primarily reading documents
2. **Go Tall**: Set chat to ~60% if you're having long conversations
3. **Balance**: Keep default 40/60 split for mixed usage
4. **Experiment**: The layout saves automatically, so try different sizes

The horizontal resizable layout provides a much more natural and flexible user experience for the Policy Q&A application!
