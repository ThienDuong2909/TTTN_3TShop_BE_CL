# API Logging Middleware

This middleware logs all API requests and responses to help with debugging and monitoring.

## Features

- 📝 Logs all API requests with method, URL, IP, headers
- ⏱️ Tracks request duration
- 📊 Shows response status and success/error information
- 🎨 Color-coded output for different status codes
- 📄 Option to save logs to file
- 🔧 Can be enabled/disabled via environment variables

## Configuration

Add these environment variables to your `.env` file:

```env
# Set to 'false' to disable API logging
API_LOGGING=true

# Set to 'true' to save logs to file (in addition to console)
LOG_TO_FILE=false
```

## Example Log Output

```
🔵 ============= API REQUEST =============
📅 Time: 12/12/2023, 10:30:45 AM
🌐 GET /api/products/1/colors-sizes
🔗 IP: ::1
🔐 Auth: Bearer ***
📱 User-Agent: Mozilla/5.0...
⏱️ Duration: 45ms
📊 Status: 200
✅ Success: true
💬 Message: Lấy danh sách màu và size của sản phẩm thành công
📊 Data Length: 3 items
🟢 ============= SUCCESS =============
```

## Status Color Coding

- 🟢 Green: Success (200-299)
- 🟡 Yellow: Client Error (400-499)
- 🔴 Red: Server Error (500+)
- ⚪ White: Other status codes

## Log Files

When `LOG_TO_FILE=true` is set, logs will be saved to:
- `/logs/api-YYYY-MM-DD.log`
- One file per day
- Emoji icons are removed from file logs for cleaner text

## Disable Logging

To disable logging entirely, set in your `.env` file:
```env
API_LOGGING=false
``` 