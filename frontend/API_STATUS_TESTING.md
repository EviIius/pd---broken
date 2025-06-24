# API Status Testing Guide

This guide helps test the different API status states in the Policy Q&A application.

## Status States

The application now shows real-time API status in three locations:

### 1. **Header Status Indicator** (next to title)
- **Green dot + "Online"**: API is working correctly
- **Red dot + "Offline"**: API has an error
- **Blue spinning icon + "Checking..."**: Currently checking status

### 2. **Color Bar** (below header)
- **Green**: API connected
- **Red**: API error
- **Blue**: Checking status

### 3. **Detailed Tooltip** (hover over title)
- Shows detailed status information
- Displays error messages if any
- Shows last check time
- Includes **clickable refresh button** with improved hover behavior
- **Fixed**: Tooltip now stays open when hovering over content
- **Enhanced**: Refresh button is larger and shows "Refresh" text

## Tooltip Interaction Improvements

### ✅ **Fixed Hover Behavior**
- **Problem**: Tooltip disappeared too quickly when trying to click refresh button
- **Solution**: Added 150ms delay before closing tooltip
- **Benefit**: Easy access to refresh button and error details

### **How It Works**
1. **Hover over title**: Tooltip appears
2. **Move to tooltip content**: Tooltip stays open
3. **Click refresh button**: Manually trigger status check
4. **Move away**: Tooltip closes after brief delay

### **Enhanced Refresh Button**
- **Larger click area** with padding
- **Visual text label** showing "Refresh" 
- **Disabled state** when already checking
- **Spinning animation** during refresh

## Testing Different States

### ✅ Healthy State
- Gemini API key is configured correctly
- API responds normally
- Shows green indicators

### ❌ Error States

#### Missing API Key
1. Remove or rename `.env.local` file
2. Restart the development server
3. Should show: "Gemini API key not configured"

#### Invalid API Key
1. Set `GEMINI_API_KEY` to an invalid value in `.env.local`
2. Restart the development server
3. Should show: "Gemini API connection failed"

#### Network Issues
1. Stop the development server
2. Try to access the application
3. Should show: "Unable to connect to API"

## Manual Testing Commands

```bash
# Test health endpoint directly
curl http://localhost:3000/api/health

# Test with missing API key
# (remove .env.local and restart server)

# Test with invalid API key
# (set invalid key in .env.local and restart server)
```

## Automatic Status Checks

The system automatically:
- Checks API status every 60 seconds
- Shows loading state during checks
- Updates indicators in real-time
- Allows manual refresh via tooltip button

## Implementation Details

- **Health Endpoint**: `/api/health` - dedicated status checking
- **Status Hook**: `useApiStatus` - manages status state
- **Visual Feedback**: Multiple indicators for different contexts
- **Error Handling**: Detailed error messages and recovery options
